import { Typography } from "@material-tailwind/react"
import imgLogo from "../../../assets/img/LogoTipo.png"
import { AvatarUser } from "../ui/AvatarUser"
export const Navbar = () => {
  return (
    <nav className="bg-bg-card border-b border-accent/10 shadow-lg sticky top-0 z-50">
      <div className="w-full px-6 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={imgLogo}
          alt="Noir & Grill Logo" 
          className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover border border-accent/30 drop-shadow-[0_0_10px_rgba(245,200,66,0.3)] shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
          <Typography variant="h5" className="font-bold text-accent font-serif tracking-widest hidden sm:block">
            Noir & Grill
          </Typography>
        </div>
        <AvatarUser />
      </div>
    </nav>

  )
}
