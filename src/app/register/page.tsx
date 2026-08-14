import RegisterForm from "@/components/auth/register-form";

export const metadata = { title: "Create account | Student Career OS" };

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <RegisterForm />
    </main>
  );
}
