# vitepress

- 行高亮 `js{2,5-8}`, `// [!code highlight]`
- 行聚焦 `// [!code focus]`, `// [!code focus:<lines>]`
- 警告和错误 `// [!code warning]`, `// [!code error]`
- diff `// [!code ++]`, `// [!code --]`
- 代码组

````md
::: code-group

```tsx [parent-demo.tsx]
export default function ChildDemo() {
  return <>ParentDemo</>;
}
```

```tsx [child-demo.tsx]
export default function ChildDemo() {
  return <>ChildDemo</>;
}
```

:::
````

````md
```js{2}
export default {
  msg: 'highlighted!'
}
```
````

```md
> [!caution]
> [!important]
> [!note]
> [!tip]
> [!warning]
>
> 自定义容器
```
