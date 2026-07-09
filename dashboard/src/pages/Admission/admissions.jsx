import PageHeading from "@/layout/PageHeading";

import { useState } from "react";
import { useNavigate } from "react-router";
import BulkUploadDialog from "../../components/admissions/BulkUpload";

export default function Admissions() {
    const [openUploadModal, setOpenUploadModal] = useState(false);

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

            <BulkUploadDialog
                open={openUploadModal}
                onClose={() => setOpenUploadModal(false)}
            />
        </>
    );
}
