import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const password = process.env.APP_PASSWORD ?? "";
  return <LoginForm hint={password} />;
}
