import type { Route } from "./+types/home";
import App from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NoteBookOne " },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <App />;
}
