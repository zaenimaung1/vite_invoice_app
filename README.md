# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Project components

### Container

The `Container` component is a small layout helper that centralizes page content and applies consistent horizontal padding.

Props:

- `children` — content to render inside the container
- `className` — extra Tailwind classes to apply
- `fluid` — when true, make the container full-width but keep horizontal padding
- `as` — choose the rendered element type (defaults to `div`)

Example:

```jsx
import Container from './src/components/Container'

export default function Page(){
	return (
		<Container className="py-8">
			<h2 className="text-2xl">Hello</h2>
		</Container>
	)
}
```

## Notes - Product row component

`ProductDataList` now renders a single `<tr>` row and is used by `ProductList` which owns the table header and wrapper. This separation makes the table easier to maintain and reuse across pages.

When modifying `ProductDataList`, keep the parent table markup (thead/tbody) consistent so rows render correctly.

### Sales form & table

`SaleList` was redesigned to be responsive and more usable on both mobile and desktop:

- The form now uses a responsive grid: 1 column on small, 2 columns on small/medium, and 3 columns on large screens.
- Inputs include Voucher ID, Customer name, Email, Price and Date with inline validation error messages.
- A small recent sales table sits below the form to preview entries (sample data is used for the demo). In a real app this should be wired to an API/state.

The redesign ensures inputs and buttons align nicely across breakpoints and the recent sales table remains horizontally scrollable on small screens.

### Product list (compact table)

The `ProductList` component uses a compact, clean table layout with:

- subtle borders and alternating row hover states
- a small top toolbar with search and Add Product CTA
- action buttons represented as small pills (Edit/Delete)

This gives a more readable, modern appearance while keeping the layout compact on desktops and horizontally-scrollable on small screens.

### Voucher list

`VoucherList` is a compact table showing voucher records. It displays the following columns:

- `id` — the voucher identifier
- `productName` — name of the product the voucher applies to
- `price` — voucher value or product price
- `createdAt` — ISO or date string for when the voucher was created
- `actions` — small pill buttons for Edit / Delete

The component uses a static sample dataset for UI/demo purposes; connect it to your API/store to show live data.
