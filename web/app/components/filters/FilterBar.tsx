export default function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="filterbar bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-xl border-2 border-pink-200 p-2 md:p-3 flex flex-wrap items-end gap-2 shadow-md sticky top-10 z-[1020]">
      {children}
    </div>
  )
}


