import React from "react";
import Image from "next/image";
import Link from "next/link";
import sessionImage from "../../public/book-seesion.png";

const LeftSideMessage = () => {
  const users = [
    { id: 1, name: "Sophia Clark", topic: "Data Analysis" },
    { id: 2, name: "Ethan Carter", topic: "Machine Learning" },
    { id: 3, name: "Olivia Bennett", topic: "Web Development" },
    { id: 4, name: "Liam Harper", topic: "UI/UX Design" },
    { id: 5, name: "Ava Foster", topic: "Mobile App Development" },
       { id: 1, name: "Sophia Clark", topic: "Data Analysis" },
    { id: 2, name: "Ethan Carter", topic: "Machine Learning" },
    { id: 3, name: "Olivia Bennett", topic: "Web Development" },
    { id: 4, name: "Liam Harper", topic: "UI/UX Design" },
    { id: 5, name: "Ava Foster", topic: "Mobile App Development" },
  ];

  return (
    <div className="w-1/4">
      <div className="border rounded-lg shadow-sm bg-gray-50 p-4 h-[610px] flex flex-col">
        <h3 className="font-semibold text-lg mb-4">Incoming Requests</h3>
        <div className="space-y-4 overflow-y-auto pr-2 hide-scrollbar">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/messaging/${user.id}`} 
              className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100 transition"
            >
              <div className="relative">
                <Image
                  src={sessionImage}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border border-white"></span>
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.topic}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSideMessage;
