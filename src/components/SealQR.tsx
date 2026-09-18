import QRCode from 'react-qr-code'

export function SealQR({ value, caption }: { value: string; caption: string }) {
  return (
    <div className="border-2 border-ink bg-white p-3 shadow-neo-sm">
      <div className="mx-auto w-fit border-2 border-ink bg-white p-2">
        <QRCode value={value} size={144} fgColor="#1A1A1A" bgColor="#FFFFFF" />
      </div>
      <p className="mt-2 text-center text-[11px] font-bold">{caption}</p>
    </div>
  )
}
