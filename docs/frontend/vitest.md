# Vitest

## 测试分类

react 组件的测试方法:

- 在简化的测试环境中 (jsdom, happy-dom, ...) 渲染组件树, 并对渲染输出进行断言
- 在真实的浏览器环境中运行完整应用, 也称为端到端测试 (end-to-end tests)

## 第一个测试

### 配置

```bash
pnpm add \
@testing-library/dom \
@testing-library/jest-dom \
@testing-library/react \
@testing-library/user-event \
@vitest/coverage-v8 \
@vitest/ui \
jsdom \
vitest -D
```

::: code-group

```ts [vitest.config.ts]
// 配置合并
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { defineConfig as defineTestConfig, mergeConfig } from "vitest/config";

// https://vitest.dev/guide/#configuring-vitest
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

// https://vite.dev/config/
const viteConfig = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    fs: {
      // for Rush.js
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        "../../common/temp/node_modules",
      ],
    },
  },
});

export default mergeConfig(
  viteConfig,
  defineTestConfig({
    test: {
      // 默认 node, 通过 jsdom 模拟浏览器环境
      environment: "jsdom",
    },
  }),
);
```

```tsx [src/App.tsx]
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>role: heading</h1>
      <div className="counter">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
```

```tsx [tests/App.test.tsx]
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";
import "@testing-library/jest-dom/vitest";

test("h1 to h6 element should be in the document", () => {
  render(<App />);

  // h1 to h6: role=heading
  const headingElement = screen.getByRole("heading");
  const buttonElement = screen.getByRole("button");
  // 必须副作用导入 "@testing-library/jest-dom/vitest" 以使用 toBeInTheDocument()
  expect(headingElement).toBeInTheDocument();
  expect(buttonElement).toBeInTheDocument();
});
```

:::

## act

使用 act() 测试组件渲染

```tsx
import { expect, test } from "vitest";
import App from "@/App";
import { act } from "react";
import { createRoot } from "react-dom/client";

test("react act", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  // 使用 act() 包裹组件渲染
  act(() => {
    createRoot(container).render(<App />);
  });
  const heading = container.querySelector("h1");
  const button = container.querySelector("button");
  act(() => {
    // 使用 act() 包裹事件派发
    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  expect(heading?.textContent).toBe("role: heading");
  expect(button?.textContent).toBe("count is 1");
});
```

> [!warning] Pitfall 陷阱
> 事件派发只有在 container 被添加到文档时才有效, 即 `document.body.appendChild(container);`

## 测试渲染

::: code-group

```tsx [src/components/toggle-purple.tsx]
function TogglePurple({
  isPurple,
  setIsPurple,
}: {
  isPurple: boolean;
  setIsPurple: (isPurple: boolean) => void;
}) {
  return (
    <label>
      Purple
      <input
        type="checkbox"
        checked={isPurple}
        onChange={() => setIsPurple(!isPurple)}
      />
    </label>
  );
}

export default TogglePurple;
```

```tsx [tests/components/toggle-purple.test.tsx]
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import TogglePurple from "@/components/toggle-purple";
import "@testing-library/jest-dom/vitest";

// 避免重复渲染
let isPurple = false;
const setIsPurple = (newIsPurple: boolean) => {
  isPurple = newIsPurple;
};
render(<TogglePurple isPurple={isPurple} setIsPurple={setIsPurple} />);

test("toggle-purple checkbox", () => {
  const checkboxElement = screen.getByRole("checkbox");
  expect(checkboxElement).toBeInTheDocument();
  // not 否定断言
  expect(checkboxElement).not.toBeChecked();
});

test("toggle-purple label", () => {
  const labelElement = screen.getByText(/purple/i);
  expect(labelElement).toBeInTheDocument();
});
```

:::

## 配置简化

```ts
import { describe, test, it } from "vitest";
```

- describe 测试分组
- it 等价于 test

### 全局 API

::: code-group

```ts [vitest.config.ts]
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 默认 node, 通过 jsdom 模拟浏览器环境
    environment: "jsdom",
    // 不需要显式导入 describe, test, it 等
    globals: true,
    // 副作用导入 @testing-library/jest-dom/vitest
    setupFiles: ["./tests/setup-jsdom.ts"],
  },
});
```

```ts [tests/setup-jsdom.ts]
// 副作用导入 @testing-library/jest-dom/vitest
import "@testing-library/jest-dom/vitest";
```

```json [tsconfig[.app].json]
{
  "compilerOptions": {
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src", "tests"]
}
```

:::

优化测试

```tsx
// tests/components/toggle-purple.test.tsx
import { render, screen } from "@testing-library/react";
import TogglePurple from "@/components/toggle-purple";

describe("toggle-purple render test", () => {
  let isPurple = false;
  const setIsPurple = (newIsPurple: boolean) => {
    isPurple = newIsPurple;
  };

  beforeEach(() => {
    render(<TogglePurple isPurple={isPurple} setIsPurple={setIsPurple} />);
  });

  it("should render the checkbox and the checkbox should not be checked by default", () => {
    const checkboxElement = screen.getByRole("checkbox");
    expect(checkboxElement).toBeInTheDocument();
    expect(checkboxElement).not.toBeChecked();
    // 自动调用 testing-library 的 cleanup 函数, 卸载组件并销毁容器
  });

  it("should render the label with purple text", () => {
    screen.debug();
    const labelElement = screen.getByText(/purple/i);
    expect(labelElement).toBeInTheDocument();
  });
});
```

## 用户交互

::: code-group

```tsx [错误示例]
import { render, screen } from "@testing-library/react";
import TogglePurple from "@/components/toggle-purple";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

describe("toggle-purple render test", () => {
  // 无效的 hook 调用, hook 只能在函数组件的内部调用
  const [isPurple, setIsPurple] = useState(false);

  beforeEach(() => {
    render(<TogglePurple isPurple={isPurple} setIsPurple={setIsPurple} />);
  });

  describe("user interaction test", () => {
    it("should be checked after user click", async () => {
      const checkboxElement = screen.getByRole("checkbox");
      const user = userEvent.setup();
      await user.click(checkboxElement);
      expect(checkboxElement).toBeChecked();
    });
  });
});
```

```tsx{19,20} [tests/components/toggle-purple.test.tsx]
import { render, screen } from "@testing-library/react";
import TogglePurple from "@/components/toggle-purple";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

function TogglePurple4mock() {
  const [isPurple, setIsPurple] = useState(false);
  return <TogglePurple isPurple={isPurple} setIsPurple={setIsPurple} />;
}

describe("toggle-purple render test", () => {
  beforeEach(() => {
    render(<TogglePurple4mock />);
  });

  describe("user interaction test", () => {
    it("should be checked after user click", async () => {
      const checkboxElement = screen.getByRole("checkbox");
      const user = userEvent.setup();
      await user.click(checkboxElement);
      expect(checkboxElement).toBeChecked();
    });
  });
});
```

:::

## 遍历测试

### Vitest UI

```bash
pnpm add @vitest/ui -D
pnpm exec vitest --ui
```

```tsx{31-35}
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import SelectColor from "@/components/select-color";

function SelectColor4mock() {
  const [textColor, setTextColor] = useState("");
  return <SelectColor textColor={textColor} setTextColor={setTextColor} />;
}

describe("select-color render test", () => {
  beforeEach(() => {
    render(<SelectColor4mock />);
  });

  describe("static render test", () => {
    it("should render the select element", () => {
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select#technical_summary
      const selectElement = screen.getByRole("combobox");
      expect(selectElement).toBeInTheDocument();
    });

    it("should render the label element", () => {
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select#technical_summary
      const labelElement = screen.getByText(/text color/i);
      expect(labelElement).toBeInTheDocument();
    });
  });

  describe("interaction test", () => {
    it.each([
      { optionValue: "", label: "white" },
      { optionValue: "text-blue", label: "blue" },
      { optionValue: "text-green", label: "green" },
    ])(
      "should display the $label after user click the $label option",
      async ({ optionValue }) => {
        const selectElement = screen.getByRole("combobox");
        // screen.debug();

        const user = userEvent.setup();
        await user.click(selectElement);
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option#technical_summary
        const optionElements = screen.getAllByRole("option");
        expect(optionElements).toHaveLength(3);

        // <option value="text-green">Green</option>
        // name: Green, value: text-green
        await user.selectOptions(selectElement, optionValue);
        expect(selectElement).toHaveValue(optionValue);
      },
    );
  });
});
```

## 测试覆盖

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 默认 node, 通过 jsdom 模拟浏览器环境
    environment: "jsdom",
    // 不需要显式导入 describe, test, it 等
    globals: true,
    // 副作用导入 @testing-library/jest-dom/vitest
    setupFiles: ["./tests/setup-jsdom.ts"],
    // 测试覆盖
    coverage: {
      enabled: true,
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
    },
  },
});
```

## 键盘输入

```tsx{43-47}
import { cleanup, render, screen } from "@testing-library/react";
import CircleProperty from "@/components/circle-property";
import userEvent from "@testing-library/user-event";
import { useState, type PropsWithChildren } from "react";

describe("circle-property render test", () => {
  function CircleProperty4mock({ children = "demo" }: PropsWithChildren) {
    const [property, setProperty] = useState(0);
    return (
      <CircleProperty property={property} setProperty={setProperty}>
        {children}
      </CircleProperty>
    );
  }

  beforeEach(() => {
    render(<CircleProperty4mock />);
  });

  describe("static render test", () => {
    it("should render the input element", () => {
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#technical_summary
      const inputElement = screen.getByRole("spinbutton");
      expect(inputElement).toBeInTheDocument();
    });

    it("should render the label element", () => {
      // Unmount the `<CircleProperty4mock>` component by `beforeEach()`
      cleanup();
      const labelText = "vitest is awesome";
      render(<CircleProperty4mock>{labelText}</CircleProperty4mock>);
      screen.debug();
      const labelElement = screen.getByText(labelText);
      expect(labelElement).toBeInTheDocument();
    });
  });

  describe("interaction test", () => {
    it("should display the correct value after user type", async () => {
      const inputElement = screen.getByRole("spinbutton");
      const user = userEvent.setup();
      const inputNumber = 30;
      await user
         // MUST `click()` before `keyboard()`
        .click(inputElement)
        .then(() => user.clear(inputElement))
        .then(() => user.keyboard(inputNumber.toString()));
      expect(inputElement).toHaveValue(inputNumber);
    });
  });
});
```

## Vitest 浏览器模式

### Why

::: code-group

```tsx [@/components/button.tsx]
import { useState, type ComponentProps, type MouseEvent } from "react";
import "./button.css";

function Button(props: ComponentProps<"button">) {
  const { onClick, children, ...rest } = props;
  const [content, setContent] = useState("Click me");
  const [classNames, setClassNames] = useState("btn");

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setContent((content) => (content === "Click me" ? "Active" : "Click me"));
    setClassNames((classNames) =>
      classNames === "btn" ? "btn active" : "btn",
    );
  };

  return (
    <button {...rest} onClick={handleClick} className={classNames}>
      {children ?? content}
    </button>
  );
}

export default Button;
```

```css [@/components/button.css]
.active {
  color: #fff;
  background: #fb2c36;
}
```

```tsx [tests/components/button.test.tsx]
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "@/components/button";

it("should display red color after user click", async () => {
  // Arrange
  render(<Button />);
  const buttonElement = screen.getByRole("button");
  const user = userEvent.setup();

  // Act
  await user.click(buttonElement);

  // Assert
  expect(buttonElement).toHaveClass("active");
  expect(buttonElement).toHaveStyle({
    backgroundColor: "hex(#fb2c36)",
  });

  const actualBackgroundColor =
    window.getComputedStyle(buttonElement).backgroundColor;
  // Expected: "rgb(251, 44, 54)"
  // Received: "rgba(0, 0, 0, 0)"
  // 解决方法: 使用 vitest 浏览器模式
  expect(actualBackgroundColor).toBe("rgb(251, 44, 54)");
});
```

:::

### 配置

```bash
pnpm add \
@vitest/coverage-v8 \
@vitest/ui \
jsdom \
@vitest/browser-playwright \
vitest-browser-react \
vitest -D
```

::: code-group

```ts [vite.config.ts]
/// <reference types="vitest/config" />
// https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    // 浏览器模式
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/config/browser/playwright
      instances: [{ browser: "chromium" }],
    },
  },
});
```

```tsx [tests/components/button.test.tsx]
import Button from "@/components/button";

// import { render, screen } from "@testing-library/react";
import { render } from "vitest-browser-react";

// import userEvent from "@testing-library/user-event";
import { userEvent } from "vitest/browser";

it("should display red color after user click", async () => {
  // Arrange
  const renderResult = await render(<Button />);
  const buttonLocator = renderResult.getByRole("button");
  // const user = userEvent.setup();

  // Act
  await userEvent.click(buttonLocator);
  renderResult.debug();

  // Assert
  const backgroundColor = window.getComputedStyle(
    buttonLocator.element(),
  ).backgroundColor;
  expect(backgroundColor).toBe("rgb(251, 44, 54)");
});
```

:::
