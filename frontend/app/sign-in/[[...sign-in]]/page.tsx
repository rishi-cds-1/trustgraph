import { SignIn } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { RETURN_TO_PARAM, routes, safeReturnTo } from "@/constants";
import { layout } from "@/constants/styles";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const raw = (await searchParams)[RETURN_TO_PARAM];
  const destination = safeReturnTo(Array.isArray(raw) ? raw[0] : raw) ?? routes.dashboard;

  return (
    <>
      <Navbar />
      <main className={`${layout.pageCentered} pt-32`}>
        <SignIn
          forceRedirectUrl={destination}
          fallbackRedirectUrl={destination}
          signUpUrl={routes.signUp}
        />
      </main>
    </>
  );
}
