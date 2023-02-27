"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBookmarks = exports.bookmarkPost = exports.getPostsOnTL = exports.getPost = exports.likePost = exports.deletePost = exports.updatePost = exports.createPosts = void 0;
const custom_error_1 = require("./../error-model/custom-error");
const posts_1 = __importDefault(require("../models/posts"));
const user_1 = __importDefault(require("../models/user"));
const createPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const description = req.body.description;
    console.log(req.file);
    try {
        const newPost = new posts_1.default({ description, image, userId: req.userId });
        const savedPost = yield newPost.save();
        res.status(200).json(savedPost);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.createPosts = createPosts;
const updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield posts_1.default.findById(req.params.id);
        if ((post === null || post === void 0 ? void 0 : post.userId) === req.userId) {
            yield (post === null || post === void 0 ? void 0 : post.updateOne({
                $set: req.body
            }));
            res.status(200).json("Post updated successfully");
        }
        else {
            const error = new custom_error_1.CustomError("You can only update posts made by you!", 403);
            throw error;
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield posts_1.default.findById(req.params.id);
        if (!post) {
            const error = new custom_error_1.CustomError("Post not found!", 403);
            throw error;
        }
        if (post.userId === req.userId) {
            yield (post === null || post === void 0 ? void 0 : post.deleteOne());
            res.status(200).json("Post deleted successfully");
        }
        else {
            const error = new custom_error_1.CustomError("You can only delete posts made by you!", 403);
            throw error;
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.deletePost = deletePost;
const likePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield posts_1.default.findById(req.params.id);
        if (!post) {
            const error = new custom_error_1.CustomError("Post not found!", 403);
            throw error;
        }
        const targetUser = yield user_1.default.findById(post.userId);
        if (!targetUser) {
            const error = new custom_error_1.CustomError("User not found!", 404);
            throw error;
        }
        if (req.userId) {
            const currentUser = yield user_1.default.findById(req.userId);
            if (!post.likes.includes(req.userId)) {
                yield post.updateOne({ $push: { likes: req.userId } });
                yield (targetUser === null || targetUser === void 0 ? void 0 : targetUser.updateOne({
                    $push: {
                        notifications: {
                            actions: `${currentUser === null || currentUser === void 0 ? void 0 : currentUser.username} liked your post`,
                            read: false,
                            dateOfAction: new Date().toISOString()
                        }
                    }
                }));
                res.status(200).json("User liked post!");
            }
            else {
                yield post.updateOne({ $pull: { likes: req.userId } });
                res.status(403).json("Like removed from post");
            }
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.likePost = likePost;
const getPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield posts_1.default.findById(req.params.id);
        res.status(200).json(post);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.getPost = getPost;
const getPostsOnTL = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = yield user_1.default.findById(req.params.id);
        const userPosts = yield posts_1.default.find({ userId: currentUser === null || currentUser === void 0 ? void 0 : currentUser._id });
        if (!currentUser) {
            const error = new custom_error_1.CustomError("User not found!", 404);
            throw error;
        }
        const friendPosts = yield Promise.all(currentUser.following.map(friendId => { return posts_1.default.find({ userId: friendId }); }));
        res.status(200).json(userPosts.concat(...friendPosts));
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.getPostsOnTL = getPostsOnTL;
const bookmarkPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield posts_1.default.findById(req.params.id);
        if (!post) {
            const error = new custom_error_1.CustomError("Post not found!", 404);
            throw error;
        }
        const currentUser = yield user_1.default.findById(req.userId);
        if (!currentUser) {
            const error = new custom_error_1.CustomError("User not found!", 404);
            throw error;
        }
        if (!currentUser.bookmarks.includes(post.id)) {
            yield currentUser.updateOne({ $push: { bookmarks: post.id } });
            res.status(200).json("Added to bookmarks");
        }
        else {
            yield currentUser.updateOne({ $pull: { bookmarks: post.id } });
            res.status(403).json("Removed from bookmarks");
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.bookmarkPost = bookmarkPost;
const getAllBookmarks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.userId).populate("bookmarks");
        if (!user) {
            const error = new custom_error_1.CustomError("User not found!", 404);
            throw error;
        }
        res.status(200).json(user["bookmarks"]);
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.getAllBookmarks = getAllBookmarks;
//# sourceMappingURL=posts.js.map