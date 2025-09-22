export default function ApplicationLogo({ logo }) {
    return (
        <img
            src={logo} // full public path starting with '/'
            alt="Logo"
            className="h-12 w-12 fill-current text-gray-500"
        />
    );
}
