import AuthPage from "@/components/AuthPage";

export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthPage mode="login" next={next?.startsWith("/") ? next : "/"} />;
}
