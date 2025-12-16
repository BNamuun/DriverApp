export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center box-border items-center">
      <div className="w-[375px] h-[750px] shadow-2xl rounded-[3rem] pb-[10px] border-[8px] border-black ring-2 ring-gray-500 overflow-y-auto py-5">
        {children}
      </div>
    </div>
  )
}
