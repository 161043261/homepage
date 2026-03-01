# Redis

REmote DIctionary Service 内存 kv 数据库

## redis 架构

- 单个 redis 节点: 如果开启了持久化, 则每隔某个时间间隔, 有一个 fork 进程, 生成 RDB 快照或 AOF 仅附加文件, 快照通过异步拷贝内存中的数据实现持久化, 缺点是可能会在快照间丢失数据
- 主从模式
- 哨兵模式
- 集群模式

### 主从模式

**架构**: 1 个主节点, 多个副本节点; 副本节点保持与主节点的数据同步

复制 ID: redis 节点有一个复制 ID 和一个偏移量, 对于节点上的每条命令, 该偏移量都会增加

复制 ID 的生成时机

- redis 节点启动
- 主节点故障, 发生故障转移, 副本节点被提升为主节点
- 主节点数据集被重置

当副本节点落后主节点几个偏移量时, 副本节点会从主节点接收剩余的命令, 并在副本节点的数据集上重放, 直到数据同步完成; 如果两个节点无法就复制 ID 达成一致, 则副本节点请求全量同步, 此时主节点会创建一个新的 rdb (redis database) 快照并发送给副本节点

无法就复制 ID 达成一致:

- 副本节点切换主节点
- 主节点故障, 发生故障转移, 副本节点被提升为主节点
- 主节点数据集被重置

数据同步期间, 主节点会缓存所有中间更新命令, 数据同步完成后, 再将这些命令发送给副本节点

如果两个节点具有相同的复制 ID 和偏移量, 则两个节点的数据集完全相同

### 哨兵模式 (sentinel)

**架构**: 1 个主节点, 多个副本节点, 通常有奇数个哨兵节点, 提高鲁棒性

- 监控: 确保主从节点的可用性
- 通知: 通知 redis 节点的事件
- 故障转移管理: 哨兵节点间相互通信, 如果法定数量 (quorum) 的哨兵节点都判定某个主节点主观下线时, 则判定客观下线, 哨兵节点执行故障转移
- 服务发现: 主节点也可以使用哨兵节点进行服务发现

### 集群模式 (cluster)

**架构**

- 集群模式没有哨兵节点
- 集群模式有多个主节点, 将数据分片 (shard) 到多个主节点
- 一个 redis 集群, 通常有奇数个主节点 (master), 每个主节点通常有 2 个副本节点 (replica)

集群扩容时, 例如分片数量 (主节点数量) 从 2 个增加到 3 个, 传统哈希 + 取模移动数据速度慢, 影响 redis 集群的可用性; redis 集群使用哈希槽, 相当于在 key 和分片间增加了一层映射: key -> 0x3fff (16384) 个哈希槽 -> 多个分片 (多个主节点); 集群扩容时, 只需要移动部分哈希槽, 速度快, 不会影响 redis 集群的可用性, key 到哈希槽的映射是固定的, 不会随着分片数量的改变而改变

2 个分片

- M1 包含从 0 到 0x1fff 的哈希槽
- M2 包含从 0x2000 到 0x3fff 的哈希槽

3 个分片

- M1 包含从 0 到 0x1554 的哈希槽
- M2 包含从 0x1555 到 0x2aaa 的哈希槽
- M3 包含从 0x2aab 到 0x3fff 的哈希槽

```ts
function keyHashSlot(key: string) {
  // return crc16(key) % 2;
  return crc16(key) % 3;
}

function keyHashSlot(key: string) {
  return crc16(key) % 0x3fff;
}
```

#### Gossip 流言协议

redis 集群使用 Gossip 流言协议保持集群健康

一个 redis 集群, 通常有奇数个主节点 (master), 每个主节点有 2 个副本节点 (slaver), 所有节点随机的通信; 如果法定数量 (quorum) 都判定某个主节点 (例如 M1) 主观下线时, 则判定 M1 客观下线, 执行故障转移; 选择 M1 的一个副本节点 R1, 提升 R1 为主节点以保持集群健康

## redis 持久化

### rdb 文件

rdb (redis database) 周期性生成数据集快照

优点: rdb 文件体积小, 重建数据集速度快; 缺点: 快照间的数据可能丢失, 依赖主进程 fork 子进程; fork 是操作系统创建主进程的副本 (子进程)

写时复制: fork 子进程时, 父子进程共享内存, 子进程 (快照进程) 持久化数据集快照到磁盘, 只有当父进程写内存时, 才会复制发生写操作的内存页

### AOF

AOF (Append Only File) 记录每个写命令, redis 服务器重启时, 重放命令, 重建数据集

缺点: AOF 文件体积大, 重建数据集速度慢

## Docker 使用 redis

```bash
docker exec -it redis /bin/bash
redis-cli
redis-cli -h <host> -p <port> -a <password>
```

## 配置

```bash
config get <param> [<param2> ...]
config set <param> <value> [<param2> <value2> ...]

# e.g.
config get loglevel
config set loglevel "notice" # 默认 notice
```

## 数据类型

- string 字符串
- hash 哈希
- list 列表
- set 集合
- zset (sorted set) 有序集合
- bitmap
- HyperLogLog
- geo
- stream

## string 字符串

- 键是 redisObject, 包含 type 类型, encoding 编码方式, ptr 值指针
- 值可以是字符串, 也可以是整数或浮点数
- 底层数据结构是 int 和 SDS (简单动态字符串)
- redisObject.encoding 编码方式有 3 种: int, embstr, raw
  - 如果值是整数, 则使用 int 编码
  - 如果值是字符串且长度 <= 44 字节, 则使用 SDS 和 embstr 编码, embstr 编码通过 1 次内存分配保存 redisObject 和 SDS
    - 优点: 1 次内存分配, 键值的内存地址连续
    - 缺点: 如果增加 embstr 编码的字符串的长度, redisObject 和 SDS 都需要重新分配内存; 所以 embstr 编码的 kv 实际上是只读的, 修改 embstr 编码的字符串时, 先将编码方式从 embstr 转换为 raw, 再执行修改
  - 如果值是字符串且长度 > 44 字节, 则使用 SDS 和 raw 编码, raw 编码通过 2 次内存分配分别保存 redisObject 和 SDS

对比 SDS 和 C 字符串

- SDS 可以保存文本数据, 也可以保存二进制数据
- SDS 获取字符串长度的时间复杂度是 O(1)
- SDS 拼接字符串可以动态扩容, 不会导致缓冲区溢出

```bash
set <key> <value>
get <key>
exists <key>
strlen <key>
incr <key> # increase
incrby <key> <increment>
decr <key> # decrease
decrby <key> <decrement>
append <key> <value>
del <key> [<key2> ...]

mset <key> <value> [<key2> <value2> ...] # mset: multiple set
mget <key> [<key2> ...] # mget: multiple get

# 过期, 默认不会过期
expire <key> <seconds>
ttl <key>
set <key> <value> ex <seconds> # ex: EXpire
setex <key> <seconds> <value>
setnx <key> <value> # setnx: SET if Not eXist
```

### 应用场景

- 缓存对象
- 计数器
- 分布式锁
- 共享 session 数据

## list 列表

- list 类似 ts `string[]`, go `[]string`, 值是字符串列表
- 底层数据结构是 quicklist: 由多个 listpack 节点组成的双向链表

```bash
lpush <key> <elem> [<elem2> ...]
rpush <key> <elem> [<elem2> ...]
lpop <key>
rpop <key>
lrange <key> <start> <stop> # 左闭右闭

# 从列表表头弹出一个元素, 如果没有则阻塞 timeout 秒, 如果 timeout=0 则一直阻塞, 直到有新元素入队
blpop <key> [<key2> ...] timeout
# 从列表表尾弹出一个元素, 如果没有则阻塞 timeout 秒, 如果 timeout=0 则一直阻塞, 直到有新元素入队
brpop <key> [<key2> ...] timeout
```

### 应用场景: 消息队列

消息队列存取消息时, 必须满足

- 消息保序性 + 阻塞读取: 使用 `lpush + brpop` 或 `rpush + blpop`
- 处理重复消息
  - 生产者为每条消息生成一个全局唯一 ID
  - 消费者记录已处理的消息的 ID
- 消息可靠性: 消费者从 list 中读取一条消息, 如果消费者处理这条消息时抛出异常, 则这条消息未处理完成; 消费者重新启动后, list 中没有这条消息, 导致消息丢失; 可以使用 `brpoplpush` 命令, 在 `brpop` 命令的基础上, 将消费者从源 list 中读取的一条消息再插入到另一个目的 list (备份 list) 中

缺点: list 不支持多个消费者 (消费组) 消费同一条消息

## hash 哈希

- hash 类似 ts `Map<string, string>`, go `map[string]string`
- 底层数据结构: 如果字段数量 <= 128 且每个字段值大小 <= 64 字节, 则使用 listpack; 否则使用 hashtable

```bash
hset <key> <field> <value> [<field2> <value2> ...]
hget <key> <field>
hgetall <key>
hdel <key> <field> [<field2> ...]
hlen <key>
hincrby <key> <field> <increment>
```

## set 集合

- set 类似 ts `Set<string>`, go `map[string]struct{}`; 无序不重复; 支持交集, 并集, 差集
- 底层数据结构
  - 如果成员都是整数且成员数量 <= 512, 则使用 intset 整数集合
  - 如果成员数量较少且成员大小较小, 则使用 listpack, 否则使用 hashtable

```bash
sadd <key> <member> [<member2> ...]
srem <key> <member> [<member2> ...]
smembers <key>
# 获取成员数量
scard <key>
sismember <key> <value>
# 随机选择 count 个成员
srandmember <key> <count>
# 随机删除 count 个成员
spop <key> <count>
# 交集
sinter <key> [<key2> ...]
# 将交集结果保存到新集合 destination
sinterstore <destination> <key> [<key2> ...]
# 并集
sunion <key> [<key2> ...]
# 将并集结果保存到新集合 destination
sunionstore <destination> <key> [<key2> ...]
# 差集
sdiff <key> [<key2> ...]
# 将差集结果保存到新集合 destination
sdiffstore <destination> <key> [<key2> ...]
```

## zset (sorted set) 有序集合

- zset 类似 ts 的 `[score: number, member: string][]`, 成员不重复; 成员排序规则: zset 的每个成员都关联一个 float64 类型的分数, 成员按照分数从小到大排序, 分数相同时, 按照成员的字典序从小到大排序
- 底层数据结构: 如果成员数量 <= 128 且每个成员大小 <= 64 字节, 则使用 listpack; 否则使用 skiplist (按分数排序) + hashtable (成员到分数的映射)

```bash
zadd <key> <score> <member> [<score2> <member2> ...]
zrem <key> <member> [<member2> ...]
zscore <key> <member>
# 获取成员数量
zcard <key>
zincrby <key> <increment> <member>
zrange <key> <start> <stop> [withscores]
zrevrange <key> <start> <stop> [withscores]
```

## 底层数据结构总结

| redisObject.type |                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------ |
| string           | redisObject.encoding 编码方式有 3 种: int, embstr, raw                               |
|                  | int 编码: 值是整数                                                                   |
|                  | embstr 编码: 值是字符串且长度 <= 44 字节，redisObject 和 SDS 连续分配内存            |
|                  | raw 字符串: 值是字符串且长度 > 44 字节，redisObject 和 SDS 分别分配内存              |
| list             | quicklist: 由多个 listpack 节点组成的双向链表                                        |
| hash             | 如果字段数量 <= 128 且每个字段值大小 <= 64 字节, 则使用 listpack; 否则使用 hashtable |
| set              | 如果成员都是整数且成员数量 <= 512, 则使用 intset 整数集合                            |
|                  | 如果成员数量较少且成员大小较小, 则使用 listpack, 否则使用 hashtable                  |
| zset             | 如果成员数量 <= 128 且每个成员大小 <= 64 字节, 则使用 listpack                       |
|                  | 否则使用 skiplist (按分数排序) + hashtable (成员到分数的映射)                        |
