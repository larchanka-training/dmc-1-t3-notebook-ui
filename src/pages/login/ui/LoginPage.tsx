import { LoginForm } from "@/features/auth";
import { useLoginPage } from "../model/useLoginPage";

export function LoginPage() {
  const { redirect } = useLoginPage();

  if (redirect) {
    return redirect;
  }

  return <LoginForm />;
}
