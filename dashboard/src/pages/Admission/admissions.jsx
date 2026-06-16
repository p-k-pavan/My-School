import PageHeading from "@/layout/PageHeading";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";


export default function Admissions() {
    const [openAddModal, setOpenAddModal] = useState();
    const [openUploadModal, setOpenUploadModal] = useState();

    const navigate = useNavigate();

    return (
        <>
            <PageHeading
                title="Admissions"
                description="Manage admissions"
                showAddNew
                showBulkUpload
                onAddNew={() => navigate("/admissions/new")}
                onBulkUpload={() => setOpenUploadModal(true)}
            />

        </>
    );
}