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

        images: {
            type: [
                {
                    fileName: String,
                    fileUrl: String,
                },
            ],
            validate: {
                validator: (v) => v.length <= 10,
                message: "A post can have at most 10 images",
            },
        },

        videos: {
            type: [
                {
                    fileName: String,
                    fileUrl: String,
                },
            ],
            validate: {
                validator: (v) => v.length <= 3,
                message: "A post can have at most 3 videos",
            },
        },

        attachments: {
            type: [
                {
                    fileName: String,
                    fileUrl: String,
                    fileType: {
                        type: String,
                        enum: ["pdf", "doc", "docx", "xlsx", "ppt", "other"],
                    },
                },
            ],
            validate: {
                validator: (v) => v.length <= 5,
                message: "A post can have at most 5 attachments",
            },
        },

        viewCount: {
            type: Number,
            default: 0,
        },

        commentCount: {
            type: Number,
            default: 0,
        },

        reactionCount: {
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
            enum: ["all", "teachers", "students", "classes", "individual_students"],
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

feedPostSchema.pre("save", function (next) {
    if (this.visibility === "classes" && this.targetClasses.length === 0) {
        return next(
            new Error("targetClasses must be non-empty when visibility is 'classes'")
        );
    }
    if (
        this.visibility === "individual_students" &&
        this.targetStudents.length === 0
    ) {
        return next(
            new Error(
                "targetStudents must be non-empty when visibility is 'individual_students'"
            )
        );
    }
    next();
});

feedPostSchema.index({
    schoolId: 1,
    status: 1,
    visibility: 1,
    isPinned: -1,
    createdAt: -1,
});

feedPostSchema.index({ targetClasses: 1 });
feedPostSchema.index({ targetStudents: 1 });

feedPostSchema.index({ createdBy: 1, createdAt: -1 });

export const FeedPost = mongoose.model("FeedPost", feedPostSchema);