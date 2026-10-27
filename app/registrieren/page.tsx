import AuthPage from "@/components/AuthPage";

export const dynamic = "force-dynamic";

export default async function Registrieren({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthPage mode="register" next={next?.startsWith("/") ? next : "/"} />;
}
