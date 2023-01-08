import Skeleton from "@/components/general/skeleton";
import { useCsrf } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorField } from "@/components/utils";

export default function Login() {
  const csrf = useCsrf().data;
  return <Skeleton>{csrf && <LoginInner csrf={csrf} />}</Skeleton>;
}

const LoginSchema = z.object({
  username: z.string().min(1),
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
  const onSubmit = (data: LoginSchema) => {
    console.log(data);
  };
  return (
    <div className="mx-auto max-w-prose">
      <h1>Login</h1>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="csrfmiddlewaretoken" value={csrf} />
        <label>
          <div>email</div>
          <input type="text" {...register("username")} />
        </label>
        <ErrorField message={errors.username?.message} />
        <label>
          <div>password</div>
          <input type="password" {...register("password")} />
        </label>
        <ErrorField message={errors.password?.message} />
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
}
