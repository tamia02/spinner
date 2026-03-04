import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

const DashboardLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="h-screen w-full flex bg-[#f7f8fa] font-['Space_Grotesk'] text-[#111] overflow-hidden">
            {/* Sidebar - Fixed */}
            <div className="hidden md:flex flex-col w-64 h-full border-r border-[#eaeaea]">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full bg-[#f8f9fc] overflow-y-auto">
                <Navbar />
                <div className="flex-1 p-10 max-w-6xl w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
