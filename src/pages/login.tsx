import Skeleton from "@/components/general/skeleton";
import { useUser } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorField } from "@/components/utils";
import api from "@/external/api/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Link from "next/link";
import { signUpRoute } from "@/routes";

export function loginPath() {
  return "/login";
}

export default function Login() {
  return (
    <Skeleton>
      <LoginInner />
    </Skeleton>
  );
}

const LoginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
type LoginSchema = z.infer<typeof LoginSchema>;

function LoginInner() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(LoginSchema),
  });

  const router = useRouter();
  const userQuery = useUser();

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.player.login({ email, password }),
    onSuccess: () => {
      userQuery.refetch();
      router.push("/");
    },
  });
  const onSubmit = ({ email, password }: LoginSchema) => {
    login.mutate({ email, password });
  };
  return (
    <div className="mx-auto mt-11 flex w-full max-w-prose flex-col gap-y-4">
      <div className="w-full text-xl font-bold underline">Login</div>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <label>
          <div>email</div>
          <input className="w-full" type="text" {...register("email")} />
        </label>
        <ErrorField message={errors.email?.message} />
        <label>
          <div>password</div>
          <input
            autoComplete="off"
            className="w-full"
            type="password"
            {...register("password")}
          />
        </label>
        <ErrorField message={errors.password?.message} />
        <button type="submit" className="btn btn-primary mt-2 w-full">
          Login
        </button>
      </form>

      <div className="mt-3 flex">
        <div className="my-auto text-lg">No account?</div>
        <Link className="btn btn-link ml-2 inline" href={signUpRoute()}>
          Sign Up
        </Link>
      </div>
    </div>
  );
}
