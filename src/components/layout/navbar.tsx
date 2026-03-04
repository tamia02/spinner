import { UserButton } from "@/components/layout/user-button";

const Navbar = () => {
    return (
        <div className="flex items-center p-6 bg-transparent w-full">
            <div className="flex w-full justify-end">
                <UserButton />
            </div>
        </div>
    );
};

export default Navbar;
