import Skeleton from "@/components/general/skeleton";
import {useUser} from "@/hooks";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import { z } from "zod";
import api from "@/external/api/api";
import {useMutation} from "@tanstack/react-query";
import {ErrorField} from "@/components/utils";
import {useRouter} from "next/router";


const SignUpSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
type SignUpSchema = z.infer<typeof SignUpSchema>;


export default function SignUp() {
  const userQuery = useUser()
  const router = useRouter()
  const query = router.query as {complete?: string}
  console.log(query)

  return (
    <Skeleton>
      {query.complete === 'true'
        ? <SignUpComplete />
        : <SignUpInner />
      }
    </Skeleton>
  )
}

export function SignUpInner() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpSchema>({
    resolver: zodResolver(SignUpSchema),
  });

  const mutation = useMutation(
    ({email, password}: SignUpSchema) => api.player.signUp({email, password}),
    {
      onError: () => {
        setError('password', {message: 'There was a problem while signing up.'})
      },
      onSuccess: () => {
        router.push({query: {complete: true}})
      },
    }
  )

  const onSubmit = (data: SignUpSchema) => {
    mutation.mutate(data)
  }

  return (
    <form action="" onSubmit={handleSubmit(onSubmit)}>
      <div className="max-w-prose mx-auto">
        <h1 className="underline mt-20">Sign Up</h1>
        <label className="mt-8">
          <div>Email</div>
          <input type="text" className="w-full" {...register('email')} />
          <ErrorField message={errors.email?.message} />
        </label>
        <label className="mt-2">
          <div>Password</div>
          <input type="password" className="w-full" {...register('password')} />
          <ErrorField message={errors.password?.message} />
        </label>
        <button className="btn btn-primary w-full mt-2">Sign Up</button>
      </div>
    </form>
  )
}

function SignUpComplete() {
  return (
    <div>
      Thanks for signing up.  Please check your email to verify your account.
    </div>
  )
}
