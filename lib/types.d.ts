import type { ActionTypes } from "./Constants.js";

export type UserFlag = "replacements beta" | "approve posts" | "unlimited upload slots";
export type RecordType = "positive" | "negative" | "neutral";
export type SetVisibility = "public" | "private";
export type TagStatus = "pending" | "queued" | "processing" | "active";
export type UserLevel = "Anonymous" | "Blocked" | "Member" | "Privileged" | "Contributor" | "Former Staff" | "Janitor" | "Moderator" | "Admin";

interface User {
    id: number;
    name: string;
}
interface BaseAction<T extends ActionTypes> {
    blame: User;
    date: Date;
    type: T;
}
export interface PoolDeleteAction extends BaseAction<ActionTypes.POOL_DELETE> {
    pool: {
        id: number;
        name: string;
    };
    user: User;
}

export interface TakedownProcessAction extends BaseAction<ActionTypes.TAKEDOWN_PROCESS> {
    takedown: {
        id: number;
    };
}

export interface TakedownDeleteAction extends BaseAction<ActionTypes.TAKEDOWN_DELETE> {
    takedown: {
        id: number;
    };
}

export interface IPBanCreateAction extends BaseAction<ActionTypes.IP_BAN_CREATE> {}
export interface IPBanDeleteAction extends BaseAction<ActionTypes.IP_BAN_DELETE> {}

export interface TicketUpdateAction extends BaseAction<ActionTypes.TICKET_UPDATE> {
    ticket: {
        id: number;
    };
}

export interface TicketClaimAction extends BaseAction<ActionTypes.TICKET_CLAIM> {
    ticket: {
        id: number;
    };
}


export interface TicketUnclaimAction extends BaseAction<ActionTypes.TICKET_UNCLAIM> {
    ticket: {
        id: number;
    };
}

export interface ArtistPageRenameAction extends BaseAction<ActionTypes.ARTIST_PAGE_RENAME> {
    newName: string;
    oldName: string;
}

export interface ArtistPageLockAction extends BaseAction<ActionTypes.ARTIST_PAGE_LOCK> {
    artist: {
        id: number;
    };
}

export interface ArtistPageUnlockAction extends BaseAction<ActionTypes.ARTIST_PAGE_UNLOCK> {
    artist: {
        id: number;
    };
}

export interface ArtistUserLinkedAction extends BaseAction<ActionTypes.ARTIST_USER_LINKED> {
    artist: {
        id: number;
    };
    user: User;
}

export interface ArtistUserUnlinkedAction extends BaseAction<ActionTypes.ARTIST_USER_UNLINKED> {
    artist: {
        id: number;
    };
    user: User | null;
}

export interface UserDeleteAction extends BaseAction<ActionTypes.USER_DELETE> {
    user: User;
}

export interface UserBanAction extends BaseAction<ActionTypes.USER_BAN> {
    duration: number | null | undefined;
    user: User;
}


export interface UserUnbanAction extends BaseAction<ActionTypes.USER_UNBAN> {
    user: User;
}

export interface UserLevelChangeAction extends BaseAction<ActionTypes.USER_LEVEL_CHANGE> {
    newLevel: UserLevel;
    oldLevel: UserLevel;
    user: User;
}

export interface UserFlagsChangeAction extends BaseAction<ActionTypes.USER_FLAGS_CHANGE> {
    addedFlags: Array<UserFlag>;
    removedFlags: Array<UserFlag>;
    user: User;
}

export interface EditedUserAction extends BaseAction<ActionTypes.EDITED_USER> {
    user: {
        id: null;
        name: string;
    };
}

export interface UserBlacklistChangedAction extends BaseAction<ActionTypes.USER_BLACKLIST_CHANGED> {
    user: User;
}

export interface UserTextChangeAction extends BaseAction<ActionTypes.USER_TEXT_CHANGE> {
    user: User;
}

export interface ChangedUserTextAction extends BaseAction<ActionTypes.CHANGED_USER_TEXT> {
    user: User;
}

export interface UserUploadLimitChangeAction extends BaseAction<ActionTypes.USER_UPLOAD_LIMIT_CHANGE> {
    newLimit: number;
    oldLimit: number;
    user: User;
}

export interface UserNameChangeAction extends BaseAction<ActionTypes.USER_NAME_CHANGE> {
    newName: string;
    oldName: string;
    user: User;
}

export interface CreatedNegativeRecordAction extends BaseAction<ActionTypes.CREATED_NEGATIVE_RECORD> {
    record: {
        htmlReason: string;
        id: number;
        textReason: string;
        type: "negative";
    };
    user: User;
}

export interface CreatedNeutralRecordAction extends BaseAction<ActionTypes.CREATED_NEUTRAL_RECORD> {
    record: {
        htmlReason: string;
        id: number;
        textReason: string;
        type: "neutral";
    };
    user: User;
}

export interface CreatedPositiveRecordAction extends BaseAction<ActionTypes.CREATED_POSITIVE_RECORD> {
    record: {
        htmlReason: string;
        id: number;
        textReason: string;
        type: "positive";
    };
    user: User;
}

export interface UserFeedbackCreateAction extends BaseAction<ActionTypes.USER_FEEDBACK_CREATE> {
    record: {
        htmlReason: string;
        id: number;
        textReason: string;
        type: RecordType;
    };
    user: User;
}

export interface UserFeedbackUpdateAction extends BaseAction<ActionTypes.USER_FEEDBACK_UPDATE> {
    record: {
        htmlReason: string;
        id: number;
        textReason: string;
        type: RecordType;
    };
    user: User;
}

export interface UserFeedbackDeleteAction extends BaseAction<ActionTypes.USER_FEEDBACK_DELETE> {
    record: {
        htmlReason: string;
        id: number;
        textReason: string;
        type: RecordType;
    };
    user: User;
}

export interface SetChangeVisibilityAction extends BaseAction<ActionTypes.SET_CHANGE_VISIBILITY> {
    set: {
        id: number;
    };
    user: User;
    visibility: SetVisibility;
}

export interface SetUpdateAction extends BaseAction<ActionTypes.SET_UPDATE> {
    set: {
        id: number;
    };
    user: User;
}

export interface SetDeleteAction extends BaseAction<ActionTypes.SET_DELETE> {
    set: {
        id: number;
    };
    user: User;
}

export interface CommentUpdateAction extends BaseAction<ActionTypes.COMMENT_UPDATE> {
    comment: {
        id: number;
    };
    user: User;
}

export interface CommentDeleteAction extends BaseAction<ActionTypes.COMMENT_DELETE> {
    comment: {
        id: number;
    };
    user: User;
}

export interface CommentHideAction extends BaseAction<ActionTypes.COMMENT_HIDE> {
    comment: {
        id: number;
    };
    user: User;
}

export interface CommentUnhideAction extends BaseAction<ActionTypes.COMMENT_UNHIDE> {
    comment: {
        id: number;
    };
    user: User;
}

export interface ForumPostDeleteAction extends BaseAction<ActionTypes.FORUM_POST_DELETE> {
    forumPost: {
        id: number;
        topic: number;
    };
    user: User;
}

export interface ForumPostUpdateAction extends BaseAction<ActionTypes.FORUM_POST_UPDATE> {
    forumPost: {
        id: number;
        topic: number;
    };
    user: User;
}

export interface ForumPostHideAction extends BaseAction<ActionTypes.FORUM_POST_HIDE> {
    forumPost: {
        id: number;
        topic: number;
    };
    user: User;
}

export interface FormPostUnhideAction extends BaseAction<ActionTypes.FORUM_POST_UNHIDE> {
    forumPost: {
        id: number;
        topic: number;
    };
    user: User;
}

export interface ForumTopicHideAction extends BaseAction<ActionTypes.FORUM_TOPIC_HIDE> {
    forumTopic: {
        id: number;
        title: string;
    };
    user: User;
}

export interface ForumTopicUnhideAction extends BaseAction<ActionTypes.FORUM_TOPIC_UNHIDE> {
    forumTopic: {
        id: number;
        title: string;
    };
    user: User;
}

export interface ForumTopicDeleteAction extends BaseAction<ActionTypes.FORUM_TOPIC_DELETE> {
    forumTopic: {
        id: number;
        title: string;
    };
    user: User;
}


export interface ForumTopicStickAction extends BaseAction<ActionTypes.FORUM_TOPIC_STICK> {
    forumTopic: {
        id: number;
        title: string;
    };
    user: User;
}

export interface ForumTopicUnstickAction extends BaseAction<ActionTypes.FORUM_TOPIC_UNSTICK> {
    forumTopic: {
        id: number;
        title: string;
    };
    user: User;
}

export interface ForumTopicLockAction extends BaseAction<ActionTypes.FORUM_TOPIC_LOCK> {
    forumTopic: {
        id: number;
        title: string;
    };
    user: User;
}

export interface ForumTopicUnlockAction extends BaseAction<ActionTypes.FORUM_TOPIC_UNLOCK> {
    forumTopic: {
        id: number;
        title: string;
    };
    user: User;
}

export interface ForumCategoryCreateAction extends BaseAction<ActionTypes.FORUM_CATEGORY_CREATE> {
    forumCategory: {
        id: number;
    };
}

export interface ForumCategoryUpdateAction extends BaseAction<ActionTypes.FORUM_CATEGORY_UPDATE> {
    forumCategory: {
        id: number;
    };
}

export interface ForumCategoryDeleteAction extends BaseAction<ActionTypes.FORUM_CATEGORY_DELETE> {
    forumCategory: {
        id: number;
    };
}

export interface BlipUpdateAction extends BaseAction<ActionTypes.BLIP_UPDATE> {
    blip: {
        id: number;
    };
    user: User;
}

export interface BlipDeleteAction extends BaseAction<ActionTypes.BLIP_DELETE> {
    blip: {
        id: number;
    };
    user: {
        id: null;
        name: string;
    } | null;
}

export interface BlipHideAction extends BaseAction<ActionTypes.BLIP_HIDE> {
    blip: {
        id: number;
    };
    user: {
        id: null;
        name: string;
    } | null;
}

export interface BlipUnhideAction extends BaseAction<ActionTypes.BLIP_UNHIDE> {
    blip: {
        id: number;
    };
    user: User;
}

export interface TagAliasCreateAction extends BaseAction<ActionTypes.TAG_ALIAS_CREATE> {
    tagAlias: {
        antecedent: string;
        consequent: string;
        id: number;
    };
}

export interface TagAliasUpdateAction extends BaseAction<ActionTypes.TAG_ALIAS_UPDATE> {
    tagAlias: {
        antecedent: string;
        consequent: string;
        id: number;
        updates: {
            antecedentName?: {
                new: string;
                old: string;
            };
            approverID?: number;
            consequentName?: {
                new: string;
                old: string;
            };
            forumPostID?: number;
            forumTopicID?: number;
            postCount?: {
                new: number;
                old: number;
            };
            status?: {
                new: TagStatus;
                old: TagStatus;
            };
        };
    };
}

export interface TagImplicationCreateAction extends BaseAction<ActionTypes.TAG_IMPLICATION_CREATE> {
    tagImplication: {
        antecedent: string;
        consequent: string;
        id: number;
    };
}

export interface TagImplicationUpdateAction extends BaseAction<ActionTypes.TAG_IMPLICATION_UPDATE> {
    tagImplication: {
        antecedent: string;
        consequent: string;
        id: number;
        updates: {
            antecedentName?: {
                new: string;
                old: string;
            };
            approverID?: number;
            consequentName?: {
                new: string;
                old: string;
            };
            forumPostID?: number;
            forumTopicID?: number;
            status?: {
                new: TagStatus;
                old: TagStatus;
            };
        };
    };
}

export interface CreatedFlagReasonAction extends BaseAction<ActionTypes.CREATED_FLAG_REASON> {
    flagReason: {
        id: number;
        reason: string;
    };
}

export interface EditedFlagReasonAction extends BaseAction<ActionTypes.EDITED_FLAG_REASON> {
    flagReason: {
        id: number;
        reason: string;
    };
}

export interface DeletedFlagReasonAction extends BaseAction<ActionTypes.DELETED_FLAG_REASON> {
    flagReason: {
        id: number;
        reason: string;
    };
}

export interface ReportReasonCreateAction extends BaseAction<ActionTypes.REPORT_REASON_CREATE> {
    reportReason: {
        reason: string;
    };
}

export interface ReportReasonDeleteAction extends BaseAction<ActionTypes.REPORT_REASON_DELETE> {
    reportReason: {
        reason: string;
    };
    user: User;
}

export interface ReportReasonUpdateAction extends BaseAction<ActionTypes.REPORT_REASON_UPDATE> {
    reportReason: {
        newReason: string;
        oldReason: string;
    };
}

export interface UploadWhitelistCreateAction extends BaseAction<ActionTypes.UPLOAD_WHITELIST_CREATE> {
    whitelist: {
        entry: string | undefined;
    };
}

export interface UploadWhitelistUpdateAction extends BaseAction<ActionTypes.UPLOAD_WHITELIST_UPDATE> {
    whitelist: {
        // the types are too messy to work with when using a union
        entry?: string | undefined;
        newPattern?: string;
        oldPattern?: string;
    };
}

export interface UploadWhitelistDeleteAction extends BaseAction<ActionTypes.UPLOAD_WHITELIST_DELETE> {
    whitelist: {
        entry: string | undefined;
    };
}

export interface HelpCreateAction extends BaseAction<ActionTypes.HELP_CREATE> {
    help: {
        name: string;
        wikiPage: string;
    };
}

export interface HelpUpdateAction extends BaseAction<ActionTypes.HELP_UPDATE> {
    help: {
        name: string;
        wikiPage: string;
    };
}

export interface HelpDeleteAction extends BaseAction<ActionTypes.HELP_DELETE> {
    help: {
        name: string;
        wikiPage: string;
    };
}

export interface WikiPageDeleteAction extends BaseAction<ActionTypes.WIKI_PAGE_DELETE> {
    wikiPage: {
        name: string;
    };
}

export interface WikiPageLockAction extends BaseAction<ActionTypes.WIKI_PAGE_LOCK> {
    wikiPage: {
        name: string;
    };
}

export interface WikiPageUnlockAction extends BaseAction<ActionTypes.WIKI_PAGE_UNLOCK> {
    wikiPage: {
        name: string;
    };
}

export interface WikiPageRenameAction extends BaseAction<ActionTypes.WIKI_PAGE_RENAME> {
    wikiPage: {
        newName: string;
        oldName: string;
    };
}

export interface MassUpdateAction extends BaseAction<ActionTypes.MASS_UPDATE> {
    newTag: string;
    oldTag: string;
}

export interface NukeTagAction extends BaseAction<ActionTypes.NUKE_TAG> {
    tag: string;
}

export interface MascotCreateAction extends BaseAction<ActionTypes.MASCOT_CREATE> {
    mascot: {
        id: number;
    };
}

export interface MascotUpdateAction extends BaseAction<ActionTypes.MASCOT_UPDATE> {
    mascot: {
        id: number;
    };
}

export interface MascotDeleteAction extends BaseAction<ActionTypes.MASCOT_DELETE> {
    mascot: {
        id: number;
    };
}

export interface BulkRevertAction extends BaseAction<ActionTypes.BULK_REVERT> {
    user: User;
}

export interface PostMoveFavoritesAction extends BaseAction<ActionTypes.POST_MOVE_FAVORITES> {
    favorites: {
        newPost: number;
        oldPost: number;
    };
}

export interface PostDeleteAction extends BaseAction<ActionTypes.POST_DELETE> {
    post: {
        htmlReason: string;
        id: number;
        textReason: string;
    };
}

export interface PostUndeleteAction extends BaseAction<ActionTypes.POST_UNDELETE> {
    post: {
        id: number;
    };
}

export interface PostDestroyAction extends BaseAction<ActionTypes.POST_DESTROY> {
    post: {
        id: number;
    };
}

export interface PostRatingLockAction extends BaseAction<ActionTypes.POST_RATING_LOCK> {
    post: {
        action: "locked" | "unlocked";
        id: number;
    };
}

export interface PostUnapproveAction extends BaseAction<ActionTypes.POST_UNAPPROVE> {
    post: {
        id: number;
    };
}

export interface PostReplacementAcceptAction extends BaseAction<ActionTypes.POST_REPLACEMENT_ACCEPT> {
    post: {
        id: number;
    };
}

export interface PostReplacementRejectAction extends BaseAction<ActionTypes.POST_REPLACEMENT_REJECT> {
    post: {
        id: number;
    };
}

export interface PostReplacementDeleteAction extends BaseAction<ActionTypes.POST_REPLACEMENT_DELETE> {
    post: {
        id: number;
    };
}

export type AnyAction = PoolDeleteAction | BulkRevertAction | MassUpdateAction | NukeTagAction |
TakedownProcessAction | TakedownDeleteAction |
IPBanCreateAction | IPBanDeleteAction |
TicketUpdateAction | TicketClaimAction | TicketUnclaimAction |
ArtistPageRenameAction | ArtistPageLockAction | ArtistPageUnlockAction | ArtistUserLinkedAction | ArtistUserUnlinkedAction |
UserDeleteAction | UserBanAction | UserUnbanAction | UserLevelChangeAction | UserFlagsChangeAction | EditedUserAction | UserBlacklistChangedAction | UserTextChangeAction | ChangedUserTextAction | UserUploadLimitChangeAction | UserNameChangeAction |
CreatedNegativeRecordAction | CreatedNeutralRecordAction | CreatedPositiveRecordAction |
UserFeedbackCreateAction | UserFeedbackUpdateAction | UserFeedbackDeleteAction |
SetChangeVisibilityAction | SetUpdateAction | SetDeleteAction |
CommentUpdateAction | CommentDeleteAction | CommentHideAction | CommentUnhideAction |
ForumPostDeleteAction | ForumPostUpdateAction | ForumPostHideAction | FormPostUnhideAction |
ForumTopicHideAction | ForumTopicUnhideAction | ForumTopicDeleteAction | ForumTopicStickAction | ForumTopicUnstickAction | ForumTopicLockAction | ForumTopicUnlockAction |
ForumCategoryCreateAction | ForumCategoryUpdateAction | ForumCategoryDeleteAction |
BlipUpdateAction | BlipDeleteAction | BlipHideAction | BlipUnhideAction |
TagAliasCreateAction | TagAliasUpdateAction |
TagImplicationCreateAction | TagImplicationUpdateAction |
CreatedFlagReasonAction | EditedFlagReasonAction | DeletedFlagReasonAction |
ReportReasonCreateAction | ReportReasonDeleteAction | ReportReasonUpdateAction |
UploadWhitelistCreateAction | UploadWhitelistUpdateAction | UploadWhitelistDeleteAction |
HelpCreateAction | HelpUpdateAction | HelpDeleteAction |
WikiPageDeleteAction | WikiPageLockAction | WikiPageUnlockAction | WikiPageRenameAction |
MascotCreateAction | MascotUpdateAction | MascotDeleteAction |
PostMoveFavoritesAction | PostDeleteAction | PostUndeleteAction | PostDestroyAction | PostRatingLockAction | PostUnapproveAction |
PostReplacementAcceptAction | PostReplacementRejectAction | PostReplacementDeleteAction;

export interface ActionMap {
    [ActionTypes.ARTIST_PAGE_LOCK]: ArtistPageLockAction;
    [ActionTypes.ARTIST_PAGE_RENAME]: ArtistPageRenameAction;
    [ActionTypes.ARTIST_PAGE_UNLOCK]: ArtistPageUnlockAction;
    [ActionTypes.ARTIST_USER_LINKED]: ArtistUserLinkedAction;
    [ActionTypes.ARTIST_USER_UNLINKED]: ArtistUserUnlinkedAction;
    [ActionTypes.BLIP_DELETE]: BlipDeleteAction;
    [ActionTypes.BLIP_HIDE]: BlipHideAction;
    [ActionTypes.BLIP_UNHIDE]: BlipUnhideAction;
    [ActionTypes.BLIP_UPDATE]: BlipUpdateAction;
    [ActionTypes.BULK_REVERT]: BulkRevertAction;
    [ActionTypes.CHANGED_USER_TEXT]: ChangedUserTextAction;
    [ActionTypes.COMMENT_DELETE]: CommentDeleteAction;
    [ActionTypes.COMMENT_HIDE]: CommentHideAction;
    [ActionTypes.COMMENT_UNHIDE]: CommentUnhideAction;
    [ActionTypes.COMMENT_UPDATE]: CommentUpdateAction;
    [ActionTypes.CREATED_FLAG_REASON]: CreatedFlagReasonAction;
    [ActionTypes.CREATED_NEGATIVE_RECORD]: CreatedNegativeRecordAction;
    [ActionTypes.CREATED_NEUTRAL_RECORD]: CreatedNeutralRecordAction;
    [ActionTypes.CREATED_POSITIVE_RECORD]: CreatedPositiveRecordAction;
    [ActionTypes.DELETED_FLAG_REASON]: DeletedFlagReasonAction;
    [ActionTypes.EDITED_FLAG_REASON]: EditedFlagReasonAction;
    [ActionTypes.EDITED_USER]: EditedUserAction;
    [ActionTypes.FORUM_CATEGORY_CREATE]: ForumCategoryCreateAction;
    [ActionTypes.FORUM_CATEGORY_DELETE]: ForumCategoryDeleteAction;
    [ActionTypes.FORUM_CATEGORY_UPDATE]: ForumCategoryUpdateAction;
    [ActionTypes.FORUM_POST_DELETE]: ForumPostDeleteAction;
    [ActionTypes.FORUM_POST_HIDE]: ForumPostHideAction;
    [ActionTypes.FORUM_POST_UNHIDE]: FormPostUnhideAction;
    [ActionTypes.FORUM_POST_UPDATE]: ForumPostUpdateAction;
    [ActionTypes.FORUM_TOPIC_DELETE]: ForumTopicDeleteAction;
    [ActionTypes.FORUM_TOPIC_HIDE]: ForumTopicHideAction;
    [ActionTypes.FORUM_TOPIC_LOCK]: ForumTopicLockAction;
    [ActionTypes.FORUM_TOPIC_STICK]: ForumTopicStickAction;
    [ActionTypes.FORUM_TOPIC_UNHIDE]: ForumTopicUnhideAction;
    [ActionTypes.FORUM_TOPIC_UNLOCK]: ForumTopicUnlockAction;
    [ActionTypes.FORUM_TOPIC_UNSTICK]: ForumTopicUnstickAction;
    [ActionTypes.FORUM_TOPIC_UPDATE]: never;
    [ActionTypes.HELP_CREATE]: HelpCreateAction;
    [ActionTypes.HELP_DELETE]: HelpDeleteAction;
    [ActionTypes.HELP_UPDATE]: HelpUpdateAction;
    [ActionTypes.IP_BAN_CREATE]: IPBanCreateAction;
    [ActionTypes.IP_BAN_DELETE]: IPBanDeleteAction;
    [ActionTypes.MASCOT_CREATE]: MascotCreateAction;
    [ActionTypes.MASCOT_DELETE]: MascotDeleteAction;
    [ActionTypes.MASCOT_UPDATE]: MascotUpdateAction;
    [ActionTypes.MASS_UPDATE]: MassUpdateAction;
    [ActionTypes.NUKE_TAG]: NukeTagAction;
    [ActionTypes.POOL_DELETE]: PoolDeleteAction;
    [ActionTypes.POST_DELETE]: PostDeleteAction;
    [ActionTypes.POST_DESTROY]: PostDestroyAction;
    [ActionTypes.POST_MOVE_FAVORITES]: PostMoveFavoritesAction;
    [ActionTypes.POST_RATING_LOCK]: PostRatingLockAction;
    [ActionTypes.POST_REPLACEMENT_ACCEPT]: PostReplacementAcceptAction;
    [ActionTypes.POST_REPLACEMENT_DELETE]: PostReplacementDeleteAction;
    [ActionTypes.POST_REPLACEMENT_REJECT]: PostReplacementRejectAction;
    [ActionTypes.POST_UNAPPROVE]: PostUnapproveAction;
    [ActionTypes.POST_UNDELETE]: PostUndeleteAction;
    [ActionTypes.REPORT_REASON_CREATE]: ReportReasonCreateAction;
    [ActionTypes.REPORT_REASON_DELETE]: ReportReasonDeleteAction;
    [ActionTypes.REPORT_REASON_UPDATE]: ReportReasonUpdateAction;
    [ActionTypes.SET_CHANGE_VISIBILITY]: SetChangeVisibilityAction;
    [ActionTypes.SET_DELETE]: SetDeleteAction;
    [ActionTypes.SET_UPDATE]: SetUpdateAction;
    [ActionTypes.TAG_ALIAS_APPROVE]: never;
    [ActionTypes.TAG_ALIAS_CREATE]: TagAliasCreateAction;
    [ActionTypes.TAG_ALIAS_DELETE]: never;
    [ActionTypes.TAG_ALIAS_UPDATE]: TagAliasUpdateAction;
    [ActionTypes.TAG_IMPLICATION_APPROVE]: never;
    [ActionTypes.TAG_IMPLICATION_CREATE]: TagImplicationCreateAction;
    [ActionTypes.TAG_IMPLICATION_DELETE]: never;
    [ActionTypes.TAG_IMPLICATION_UPDATE]: TagImplicationUpdateAction;
    [ActionTypes.TAKEDOWN_DELETE]: TakedownDeleteAction;
    [ActionTypes.TAKEDOWN_PROCESS]: TakedownProcessAction;
    [ActionTypes.TICKET_CLAIM]: TicketClaimAction;
    [ActionTypes.TICKET_UNCLAIM]: TicketUnclaimAction;
    [ActionTypes.TICKET_UPDATE]: TicketUpdateAction;
    [ActionTypes.UPLOAD_WHITELIST_CREATE]: UploadWhitelistCreateAction;
    [ActionTypes.UPLOAD_WHITELIST_DELETE]: UploadWhitelistDeleteAction;
    [ActionTypes.UPLOAD_WHITELIST_UPDATE]: UploadWhitelistUpdateAction;
    [ActionTypes.USER_BAN]: UserBanAction;
    [ActionTypes.USER_BLACKLIST_CHANGED]: UserBlacklistChangedAction;
    [ActionTypes.USER_DELETE]: UserDeleteAction;
    [ActionTypes.USER_FEEDBACK_CREATE]: UserFeedbackCreateAction;
    [ActionTypes.USER_FEEDBACK_DELETE]: UserFeedbackDeleteAction;
    [ActionTypes.USER_FEEDBACK_UPDATE]: UserFeedbackUpdateAction;
    [ActionTypes.USER_FLAGS_CHANGE]: UserFlagsChangeAction;
    [ActionTypes.USER_LEVEL_CHANGE]: UserLevelChangeAction;
    [ActionTypes.USER_NAME_CHANGE]: UserNameChangeAction;
    [ActionTypes.USER_TEXT_CHANGE]: UserTextChangeAction;
    [ActionTypes.USER_UNBAN]: UserUnbanAction;
    [ActionTypes.USER_UPLOAD_LIMIT_CHANGE]: UserUploadLimitChangeAction;
    [ActionTypes.WIKI_PAGE_DELETE]: WikiPageDeleteAction;
    [ActionTypes.WIKI_PAGE_LOCK]: WikiPageLockAction;
    [ActionTypes.WIKI_PAGE_RENAME]: WikiPageRenameAction;
    [ActionTypes.WIKI_PAGE_UNLOCK]: WikiPageUnlockAction;
}

// this sucks
type Filtered = {
    [K in keyof ActionMap as K]: ActionMap[K] extends never ? never : ActionMap[K]["type"];
};
export type ValidActionTypes = Filtered[keyof Filtered];
