export default function NavBar() {
  return (
    <div className="flex h-20 bg-gradient-to-r from-slate-800/70 to-cyan-900/30 drop-shadow-md px-4 items-center">
      <div>
        hardstuck
      </div>

      <div className="ml-3 bg-white/10 h-full flex items-center">
        <input
          className="px-3 bg-transparent rounded-md h-full focus:outline-none focus:border-2 border-b-0 focus:border-teal-500/30"
          type="text" />
      </div>

      <div className="ml-auto">
        right side
      </div>
    </div>
  )
}
