import { useState } from "react";
import Input from "../ui/input"; // Corrected import path
import Button from "../ui/button"; // Corrected import path

const ResetForm = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle password reset logic
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <Button type="submit">Reset Password</Button>
        </form>
    );
};

export default ResetForm;
