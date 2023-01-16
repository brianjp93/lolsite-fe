import Skeleton from "@/components/general/skeleton";
import { useCsrf, userKey } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorField } from "@/components/utils";
import api from "@/external/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

export function loginPath() {
  return "/login";
}

export default function Login() {
  const csrf = useCsrf().data;
  return <Skeleton>{csrf && <LoginInner csrf={csrf} />}</Skeleton>;
}

const LoginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
type LoginSchema = z.infer<typeof LoginSchema>;

function LoginInner({ csrf }: { csrf: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(LoginSchema),
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  const login = useMutation(
    ({ email, password }: { email: string; password: string }) =>
      api.player.login({ email, password, csrf }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(userKey);
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
        <input type="hidden" name="csrfmiddlewaretoken" value={csrf} />
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
