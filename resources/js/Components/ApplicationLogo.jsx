export default function ApplicationLogo(props) {
    return (
        <img
            src="/images/logo-icon.png"
            alt="Company Logo"
            {...props}
            className={`h-10 w-auto object-contain ${props.className || ''}`}
        />
    );
}
