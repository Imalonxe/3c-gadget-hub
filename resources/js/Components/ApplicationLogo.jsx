export default function ApplicationLogo({ className, ...props }) {
    return (
        <img
            {...props}
            className={className}
            src="/images/logo.png"
            alt="Logo"
        />
    );
}
