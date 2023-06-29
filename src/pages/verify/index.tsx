import {useMutation} from "@tanstack/react-query"
import {useRouter} from "next/router"
import api from '@/external/api/api'
import {useEffect} from "react"
import Skeleton from "@/components/general/skeleton"
import Link from "next/link"
import {loginPath} from "../login"

export default function Verify() {
  const router = useRouter()
  const query = router.query as {code?: string}
  const code = query?.code || ''

  const mutation = useMutation(
    () => api.player.verify(code || ""),
  )

  useEffect(() => {
    if (code) {
      mutation.mutate()
    }
  }, [code])

  return (
    <Skeleton>
      {mutation.isLoading &&
        <div>
          Verifying your email...
        </div>
      }
      {mutation.isSuccess &&
        <div>
          Email verified! Please
          <Link className="btn btn-link ml-1 inline" href={loginPath()}>Log In</Link>.
        </div>
      }
      {mutation.isError &&
        <div>
          There was an issue while verifying your email. It may have already
          been verified.  Try to log in, or request a new verification email.
        </div>
      }
    </Skeleton>
  )
}
