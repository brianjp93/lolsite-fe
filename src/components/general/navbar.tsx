import Link from "next/link"
import {SearchForm} from "./searchForm"

export default function NavBar() {
  return (
    <div className="flex h-20 bg-gradient-to-r from-slate-800/70 to-cyan-900/30 drop-shadow-md px-4 items-center">
      <div>
        <Link href="/">
          hardstuck
        </Link>
      </div>

      <div className="ml-3 bg-white/10 h-full flex items-center">
        <SearchForm showButton={false} showLabel={false} inputClass="border-none" formClass="h-full flex" />
      </div>

      <div className="ml-auto">
        right side
      </div>
    </div>
  )
}
