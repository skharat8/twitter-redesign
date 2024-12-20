import {
  RiUser3Line,
  RiUser3Fill,
  RiHome2Line,
  RiHome2Fill,
  RiSearchLine,
  RiSearchFill,
} from "react-icons/ri";

import NavbarItem from "@/features/navigation/NavbarItem";

function Navbar() {
  const iconSize = "1.2rem";

  return (
    <nav className="flex">
      <NavbarItem
        to="/profile"
        item={<RiUser3Line size={iconSize} />}
        selectedItem={<RiUser3Fill size={iconSize} />}
      />
      <NavbarItem
        to="/"
        item={<RiHome2Line size={iconSize} />}
        selectedItem={<RiHome2Fill size={iconSize} />}
      />
      <NavbarItem
        to="/search"
        item={<RiSearchLine size={iconSize} />}
        selectedItem={<RiSearchFill size={iconSize} />}
      />
    </nav>
  );
}

export default Navbar;
