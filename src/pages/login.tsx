import Skeleton from "@/components/general/skeleton";
import { useCsrf, useUser } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorField } from "@/components/utils";
import api from "@/external/api/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";

export function loginPath() {
  return "/login";
}

export default function Login() {
  return <Skeleton>{<LoginInner />}</Skeleton>;
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

  const login = useMutation(
    ({ email, password }: { email: string; password: string }) =>
      api.player.login({ email, password }),
    {
      onSuccess: () => {
        userQuery.refetch();
        router.push("/");
      },
    }
  );
  const onSubmit = ({ email, password }: LoginSchema) => {
    login.mutate({ email, password });
  };
  return (
    <div className="mx-auto max-w-prose">
      <h1>Login</h1>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <label>
          <div>email</div>
          <input className="w-full" type="text" {...register("email")} />
        </label>
        <ErrorField message={errors.email?.message} />
        <label>
          <div>password</div>
          <input className="w-full" type="password" {...register("password")} />
        </label>
        <ErrorField message={errors.password?.message} />
        <button type="submit" className="btn btn-primary mt-2 w-full">
          Login
        </button>
      </form>
    </div>
  );
}
