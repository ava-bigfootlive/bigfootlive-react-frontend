# React 19 Complete Reference Guide

## Overview
React is a JavaScript library for building user interfaces, particularly web applications that need to be interactive and respond to data changes. React 19 brings significant improvements including Actions, better form handling, and enhanced server-side rendering capabilities.

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Hooks Reference](#hooks-reference)
3. [Built-in Components](#built-in-components)
4. [React APIs](#react-apis)
5. [React DOM APIs](#react-dom-apis)
6. [React 19 New Features](#react-19-new-features)
7. [Rules of React](#rules-of-react)
8. [Common Patterns](#common-patterns)
9. [Performance Optimization](#performance-optimization)
10. [Migration Guide](#migration-guide)

## Core Concepts

### Component Types

#### Function Components (Recommended)
```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

#### Class Components (Legacy)
```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### JSX
JSX is a syntax extension that looks like HTML but gets transformed to JavaScript:
```jsx
const element = <h1 className="greeting">Hello, world!</h1>;
// Compiles to:
const element = React.createElement('h1', {className: 'greeting'}, 'Hello, world!');
```

## Hooks Reference

### State Hooks

#### useState
Declares a state variable you can update directly.
```jsx
const [state, setState] = useState(initialState);

// Example
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

#### useReducer
Manages complex state with a reducer function.
```jsx
const [state, dispatch] = useReducer(reducer, initialArg, init?)

// Example
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

### Context Hooks

#### useContext
Reads and subscribes to a context.
```jsx
const value = useContext(MyContext);

// Example
const ThemeContext = createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Themed Button</button>;
}
```

### Ref Hooks

#### useRef
Holds a mutable reference that doesn't trigger re-renders.
```jsx
const ref = useRef(initialValue);

// Example
function TextInput() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}
```

#### useImperativeHandle
Customizes the instance value exposed to parent components.
```jsx
useImperativeHandle(ref, createHandle, dependencies?)

// Example
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
    scrollIntoView: () => {
      inputRef.current.scrollIntoView();
    },
  }));
  
  return <input ref={inputRef} />;
});
```

### Effect Hooks

#### useEffect
Synchronizes component with external systems.
```jsx
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup function
  };
}, [dependencies]);

// Example
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  
  return <div>Chat Room: {roomId}</div>;
}
```

#### useLayoutEffect
Fires synchronously after DOM mutations.
```jsx
useLayoutEffect(() => {
  // Runs before browser paint
}, [dependencies]);
```

#### useInsertionEffect
For CSS-in-JS libraries to inject styles.
```jsx
useInsertionEffect(() => {
  // Insert dynamic styles
}, [dependencies]);
```

### Performance Hooks

#### useMemo
Caches expensive calculations.
```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Example
function TodoList({ todos, filter }) {
  const filteredTodos = useMemo(
    () => todos.filter(todo => todo.text.includes(filter)),
    [todos, filter]
  );
  
  return <List items={filteredTodos} />;
}
```

#### useCallback
Caches function definitions.
```jsx
const memoizedCallback = useCallback(
  () => { doSomething(a, b); },
  [a, b]
);

// Example
function SearchResults({ query, onClick }) {
  const handleClick = useCallback(
    (item) => {
      onClick(item, query);
    },
    [onClick, query]
  );
  
  return <ResultsList onItemClick={handleClick} />;
}
```

#### useTransition
Marks state updates as non-blocking.
```jsx
const [isPending, startTransition] = useTransition();

// Example
function TabContainer() {
  const [tab, setTab] = useState('about');
  const [isPending, startTransition] = useTransition();
  
  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }
  
  return (
    <>
      <TabButtons onSelect={selectTab} />
      {isPending && <Spinner />}
      <TabContent tab={tab} />
    </>
  );
}
```

#### useDeferredValue
Defers updating non-critical UI.
```jsx
const deferredValue = useDeferredValue(value);

// Example
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  
  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <ResultsList query={deferredQuery} />
    </div>
  );
}
```

### Resource Hooks

#### use (React 19)
Reads promises and context conditionally.
```jsx
function Component() {
  const data = use(promise);
  return <div>{data}</div>;
}
```

### Action Hooks (React 19)

#### useActionState
Manages form action states.
```jsx
const [state, action, isPending] = useActionState(fn, initialState);

// Example
function UpdateName() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const name = formData.get("name");
      const error = await updateName(name);
      if (error) {
        return { error };
      }
      return { success: true };
    },
    { error: null, success: false }
  );
  
  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      <button type="submit" disabled={isPending}>Update</button>
      {state.error && <p>{state.error}</p>}
      {state.success && <p>Name updated!</p>}
    </form>
  );
}
```

#### useOptimistic
Optimistically updates UI.
```jsx
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);

// Example
function Thread({ messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, newMessage]
  );
  
  async function sendMessage(formData) {
    const message = formData.get("message");
    addOptimisticMessage({ text: message, sending: true });
    await deliverMessage(message);
  }
  
  return (
    <>
      {optimisticMessages.map((m, i) => (
        <div key={i} style={{ opacity: m.sending ? 0.5 : 1 }}>
          {m.text}
        </div>
      ))}
      <form action={sendMessage}>
        <input name="message" />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
```

#### useFormStatus
Gets form submission status.
```jsx
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}
```

### Other Hooks

#### useId
Generates unique IDs for accessibility.
```jsx
const id = useId();

// Example
function PasswordField() {
  const passwordHintId = useId();
  
  return (
    <>
      <input type="password" aria-describedby={passwordHintId} />
      <p id={passwordHintId}>Password should be at least 8 characters</p>
    </>
  );
}
```

#### useDebugValue
Labels custom hooks in React DevTools.
```jsx
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);
  
  useDebugValue(isOnline ? 'Online' : 'Offline');
  
  // Hook logic...
  return isOnline;
}
```

#### useSyncExternalStore
Subscribes to external stores.
```jsx
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?);

// Example
function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true // Server-side always returns true
  );
}
```

## Built-in Components

### Fragment
Groups multiple elements without a wrapper DOM element.
```jsx
// Long syntax
<React.Fragment>
  <ChildA />
  <ChildB />
</React.Fragment>

// Short syntax
<>
  <ChildA />
  <ChildB />
</>
```

### StrictMode
Enables additional development checks.
```jsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

### Suspense
Shows fallback while children load.
```jsx
<Suspense fallback={<Loading />}>
  <SomeComponent />
</Suspense>
```

### Profiler
Measures rendering performance.
```jsx
<Profiler id="Navigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>
```

### Activity (Experimental)
For managing activity states in complex UIs.

### ViewTransition (Experimental)
For handling view transitions.

## React APIs

### createContext
Creates a context for passing data through component tree.
```jsx
const MyContext = createContext(defaultValue);

// Example
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}
```

### lazy
Code-splits components for dynamic imports.
```jsx
const LazyComponent = lazy(() => import('./LazyComponent'));

// Usage with Suspense
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### memo
Memoizes component to prevent unnecessary re-renders.
```jsx
const MemoizedComponent = memo(Component, arePropsEqual?);

// Example
const ExpensiveList = memo(function List({ items }) {
  return items.map(item => <Item key={item.id} {...item} />);
});
```

### startTransition
Marks updates as non-blocking transitions.
```jsx
startTransition(() => {
  // Non-urgent state updates
  setSearchQuery(input);
});
```

### act
Wraps test code that causes React updates.
```jsx
act(() => {
  // Trigger React updates
  root.render(<Counter />);
});
// Make assertions
```

### cache (React 19)
Caches data fetching or computations.
```jsx
const cachedFn = cache(fn);
```

## React DOM APIs

### Client APIs

#### createRoot
Creates a root for rendering React components.
```jsx
const root = createRoot(domNode, options?);
root.render(<App />);

// Example
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
```

#### hydrateRoot
Hydrates server-rendered HTML.
```jsx
const root = hydrateRoot(domNode, reactNode, options?);

// Example
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(document.getElementById('root'), <App />);
```

### Server APIs

#### renderToString
Renders React tree to HTML string.
```jsx
const html = renderToString(reactNode, options?);
```

#### renderToPipeableStream
Renders to a Node.js readable stream.
```jsx
const { pipe, abort } = renderToPipeableStream(reactNode, options);
```

#### renderToReadableStream
Renders to a Web Stream.
```jsx
const stream = await renderToReadableStream(reactNode, options?);
```

#### renderToStaticMarkup
Renders non-interactive HTML.
```jsx
const html = renderToStaticMarkup(reactNode);
```

### Resource Preloading APIs

#### prefetchDNS
```jsx
prefetchDNS('https://api.example.com');
```

#### preconnect
```jsx
preconnect('https://api.example.com');
```

#### preload
```jsx
preload('/fonts/font.woff2', { as: 'font' });
```

#### preloadModule
```jsx
preloadModule('/modules/module.js');
```

#### preinit
```jsx
preinit('/scripts/analytics.js', { as: 'script' });
```

## React 19 New Features

### Actions
Simplify async data mutations and form handling.
```jsx
function UpdateProfile() {
  async function updateProfile(formData) {
    'use server'; // Server Action
    await saveProfile(formData);
  }
  
  return (
    <form action={updateProfile}>
      <input name="name" />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Enhanced Form Support
- Automatic form reset after successful submission
- Built-in loading states
- Error handling
- Optimistic updates

### ref as a Prop
No more forwardRef needed:
```jsx
// React 19
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// Previously required forwardRef
const MyInput = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

### Metadata Support
```jsx
function BlogPost({ post }) {
  return (
    <>
      <title>{post.title}</title>
      <meta property="og:title" content={post.title} />
      <article>{post.content}</article>
    </>
  );
}
```

### Stylesheet Management
```jsx
function Component() {
  return (
    <>
      <link rel="stylesheet" href="styles.css" precedence="default" />
      <div>Content</div>
    </>
  );
}
```

### Improved Error Handling
Better hydration error messages and recovery strategies.

### Context as Provider
```jsx
// React 19
<MyContext value={theme}>
  <App />
</MyContext>

// Previously
<MyContext.Provider value={theme}>
  <App />
</MyContext.Provider>
```

### Cleanup Functions for Refs
```jsx
<input
  ref={(ref) => {
    // Setup
    ref?.focus();
    
    return () => {
      // Cleanup
      console.log('Input unmounted');
    };
  }}
/>
```

## Rules of React

### 1. Components and Hooks Must Be Pure
- **Idempotent**: Same inputs → same outputs
- **No side effects during render**: Side effects go in event handlers or useEffect
- **Immutable props and state**: Never mutate, always create new objects

```jsx
// ❌ Bad - Mutating props
function Bad({ user }) {
  user.name = 'New Name'; // Don't mutate props!
  return <div>{user.name}</div>;
}

// ✅ Good - Creating new object
function Good({ user }) {
  const updatedUser = { ...user, name: 'New Name' };
  return <div>{updatedUser.name}</div>;
}
```

### 2. React Calls Components and Hooks
- **Never call components directly**: Use JSX
- **Never pass hooks as values**: Call them at component top level

```jsx
// ❌ Bad
const result = MyComponent({ prop: 'value' });
const hook = condition ? useStateA : useStateB;

// ✅ Good
const result = <MyComponent prop="value" />;
// Hooks must be called unconditionally at top level
```

### 3. Rules of Hooks
- **Only call at top level**: Not inside loops, conditions, or nested functions
- **Only call from React functions**: Components or custom hooks

```jsx
// ❌ Bad
function Component({ user }) {
  if (user) {
    const [name, setName] = useState(user.name); // Conditional hook!
  }
}

// ✅ Good
function Component({ user }) {
  const [name, setName] = useState(user?.name || '');
}
```

## Common Patterns

### Custom Hooks
```jsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
}
```

### Compound Components
```jsx
function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Tab = function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  
  return (
    <button
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};
```

### Render Props
```jsx
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return render(position);
}

// Usage
<MouseTracker
  render={({ x, y }) => <div>Mouse at: {x}, {y}</div>}
/>
```

### Higher-Order Components
```jsx
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const user = useAuth();
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return <Component {...props} user={user} />;
  };
}
```

## Performance Optimization

### Code Splitting
```jsx
const OtherComponent = lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtherComponent />
    </Suspense>
  );
}
```

### Memoization Strategies
```jsx
// Memoize expensive calculations
const expensiveValue = useMemo(
  () => computeExpensive(a, b),
  [a, b]
);

// Memoize callbacks
const handleClick = useCallback(
  (id) => { /* ... */ },
  [dependency]
);

// Memoize components
const MemoizedChild = memo(ChildComponent);
```

### Virtual Scrolling
```jsx
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index]}</div>
      )}
    </FixedSizeList>
  );
}
```

### Debouncing and Throttling
```jsx
function SearchInput() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <SearchResults query={debouncedQuery} />
    </>
  );
}
```

## Migration Guide

### Upgrading to React 19

#### 1. Update Dependencies
```bash
npm install react@19 react-dom@19
```

#### 2. Update TypeScript Types
```bash
npm install -D @types/react@19 @types/react-dom@19
```

#### 3. Remove forwardRef
```jsx
// Before (React 18)
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// After (React 19)
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

#### 4. Update Context.Provider
```jsx
// Before
<Context.Provider value={value}>

// After
<Context value={value}>
```

#### 5. Replace Legacy APIs
- Replace `ReactDOM.render` with `createRoot`
- Replace `ReactDOM.hydrate` with `hydrateRoot`
- Remove `findDOMNode` usage
- Update `unmountComponentAtNode` to `root.unmount()`

#### 6. Enable New Features
```jsx
// Use Actions for forms
<form action={async (formData) => {
  await submitForm(formData);
}}>

// Use optimistic updates
const [optimistic, addOptimistic] = useOptimistic(state);

// Use metadata components
<title>Page Title</title>
```

### Common Migration Issues

#### TypeScript Ref Types
```typescript
// Update ref callback types
const ref = (node: HTMLDivElement | null) => {
  if (node) {
    // Work with node
  }
};
```

#### Strict Mode Warnings
React 19 has enhanced StrictMode checks. Address any new warnings about:
- Side effects in render
- Deprecated lifecycle methods
- Legacy context API usage

## Testing with React

### React Testing Library
```jsx
import { render, screen, fireEvent } from '@testing-library/react';

test('counter increments', () => {
  render(<Counter />);
  const button = screen.getByText('Count: 0');
  fireEvent.click(button);
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Testing Hooks
```jsx
import { renderHook, act } from '@testing-library/react';

test('useCounter', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

### Testing Async Components
```jsx
import { render, screen, waitFor } from '@testing-library/react';

test('loads data', async () => {
  render(<DataComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Component Design
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into custom hooks
- Prefer function components over classes

### 2. State Management
- Lift state up when needed
- Keep state as local as possible
- Use Context sparingly
- Consider state management libraries for complex apps

### 3. Performance
- Measure before optimizing
- Use React DevTools Profiler
- Implement code splitting
- Optimize re-renders with memo and callbacks

### 4. Accessibility
- Use semantic HTML
- Add proper ARIA attributes
- Ensure keyboard navigation
- Test with screen readers

### 5. Error Boundaries
```jsx
class ErrorBoundary extends Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    console.error('Error caught:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Resources

- Official Documentation: https://react.dev
- React 19 Blog Post: https://react.dev/blog/2024/12/05/react-19
- React GitHub: https://github.com/facebook/react
- React DevTools: Browser extension for debugging
- React Testing Library: https://testing-library.com/react
- React Router: https://reactrouter.com
- State Management:
  - Redux: https://redux.js.org
  - Zustand: https://github.com/pmndrs/zustand
  - Jotai: https://jotai.org
  - Valtio: https://valtio.pmnd.rs

## Framework Recommendations

For production applications, consider using a React framework:
- **Next.js**: Full-stack React framework with SSR/SSG
- **Remix**: Modern full-stack framework
- **Gatsby**: Static site generator
- **Vite**: Fast build tool with React template

---

This comprehensive guide covers React 19's features, patterns, and best practices for building modern web applications. The library continues to evolve with a focus on developer experience, performance, and enabling better user experiences.