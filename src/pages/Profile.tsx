import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
        <div className="mb-4">
          <p className="text-gray-700">
            <strong>Name:</strong> {user.name}
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <Button onClick={() => logout()} variant="destructive">Logout</Button>
      </div>
    </div>
  );
}
