import LoginForm from "./components/LoginForm";
import AuthWrapper from "./components/AuthWrapper";

export default function Home() {
  return (
    <AuthWrapper redirectTo="/dashboard">
      <main>
        <LoginForm />
      </main>
    </AuthWrapper>
  );
}