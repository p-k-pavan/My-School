import mongoose from "mongoose";

const feedPostSchema = new mongoose.Schema(
    {

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        attachments: {
            type: [{
                fileName: String,
                fileUrl: String,
                fileType: {
                    type: String,
                    enum: ["image", "video", "pdf", "doc", "docx", "xlsx", "ppt", "other"],
                },
                fileSize: Number,
                mimeType: String,
                publicId: String,
            }],
            default: [],
            validate: {
                validator: (v) => v.length <= 5,
                message: "A post can have at most 5 attachments",
            },
        },

        viewCount: {
            type: Number,
            default: 0,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        visibility: {
            type: String,
            enum: ["all", "teachers", "classes", "individual_students"],
            default: "all",
        },

        targetClasses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Class",
            },
        ],

        targetStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
            },
        ],

        status: {
            type: String,
            enum: ["published", "draft"],
            default: "published",
        },

        isPinned: {
            type: Boolean,
            default: false,
        },

        expiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

feedPostSchema.pre("save", function () {
    if (this.visibility === "classes" && (!this.targetClasses || this.targetClasses.length === 0)) {
        throw new Error("targetClasses must be non-empty when visibility is 'classes'");
    }
    if (
        this.visibility === "individual_students" &&
        (!this.targetStudents || this.targetStudents.length === 0)
    ) {
        throw new Error("targetStudents must be non-empty when visibility is 'individual_students'");
    }
});

feedPostSchema.index({
    status: 1,
    visibility: 1,
    isPinned: -1,
    createdAt: -1,
});

feedPostSchema.index({ targetClasses: 1 });
feedPostSchema.index({ targetStudents: 1 });

feedPostSchema.index({ createdBy: 1, createdAt: -1 });

export const FeedPost = mongoose.model("FeedPost", feedPostSchema);