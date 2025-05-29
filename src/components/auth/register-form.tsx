import { useState } from "react";
import Input from "../ui/input"; // Corrected import path
import Button from "../ui/button"; // Corrected import path

const RegisterForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle registration logic
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <Button type="submit">Register</Button>
        </form>
    );
};

export default RegisterForm;
