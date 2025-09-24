import { Link } from "@inertiajs/react";
import { FaArrowLeft } from "react-icons/fa";
const BackButton = ({ url }) => {
    return (
        <Link href={route(url)}><FaArrowLeft /></Link>
    )
}
export default BackButton;