import { Link, Route, Routes } from "react-router-dom";

import { FaUsers } from "react-icons/fa";
import { MdWarehouse } from "react-icons/md";
import { FaFileInvoice } from "react-icons/fa6";

export default function AdminPage() {
    return(
        <div className="w-full h-screen bg-gray-200 flex ps-2">
            <div className="h-full w-[300px]">
                <Link to="/admin/"><div className="p-2 border flex">Home</div></Link>
                <Link to="/admin/users"><div className="p-2 border flex items-center"><FaUsers className="mr-2" />Users</div></Link>
                <Link to="/admin/products"><div className="p-2 border flex items-center"><MdWarehouse className="mr-2" />Products</div></Link>
                <Link to="/admin/orders"><div className="p-2 border flex items-center"><FaFileInvoice className="mr-2" />Orders</div></Link>
                

            </div>
            <div className="h-full bg-white w-[calc(100vw-300px)] rounded-lg">
                <Routes path="/*">
                    <Route path="/users" element={<h1>Users</h1>}/>
                    <Route path="/products" element={<h1>Products</h1>}/>
                    <Route path="/orders" element={<h1>Orders</h1>}/>
                </Routes>
            </div>
        </div>
    )
}