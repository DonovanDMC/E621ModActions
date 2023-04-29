import { ActionTypes } from "./Constants.js";
import type {
    AnyAction,
    RecordType,
    SetVisibility,
    TagStatus,
    UserFlag,
    UserLevel
} from "./types.js";

function getUser(element: HTMLTableCellElement, index = 0) {
    const userElement = element.querySelectorAll<HTMLAnchorElement>("a[href^='/users']")[index];
    if (!userElement) {
        return null;
    }
    const id = Number(userElement.href.slice("/users/".length));
    return {
        id:   isNaN(id) ? null as never : id,
        name: userElement.textContent!
    };
}

// remove the last </p></div>
function htmlReason(r: string, start: string) {
    const wrLength = start.length + 1, pdivLength = "</p></div>".length;
    let val = r.slice(r.indexOf(start) + wrLength);
    const pdiv = val.lastIndexOf("</p></div>");
    if ((val.length - pdivLength) === pdiv) {
        return val.slice(0, pdiv);
    }
    const leftover = val.slice(pdiv + pdivLength);
    val = val.slice(0, pdiv) + leftover;
    return val;
}

function textReason(r: string, start: string) {
    return r.slice(r.indexOf(start) + start.length + 1);
}

export default function parse(element: HTMLTableRowElement, useLegacyActions = false): AnyAction {
    const [dateElement, userElement, messageElement] = element.querySelectorAll("td");
    const d = dateElement.querySelector("time")?.getAttribute("datetime") ?? null;
    if (d === null) {
        console.log(dateElement.innerHTML);
        throw new Error("Failed to parse row: failed to get date from column 0");
    }
    const date = new Date(d);
    const blame = getUser(userElement);
    const message = messageElement.textContent!;

    if (blame === null) {
        console.log(userElement.innerHTML);
        throw new Error("Failed to parse row: failed to get blame from column 1");
    }

    let match: RegExpExecArray | null;

    if ((match = /Deleted pool #(?<id>\d+) \(named (?<name>.+)\) by .+$/.exec(message))) {
        return {
            blame,
            user: getUser(messageElement)!,
            date,
            pool: {
                id:   Number(match.groups!.id),
                name: String(match.groups!.name)
            },
            type: ActionTypes.POOL_DELETE
        };
    }

    if ((match = /^Completed takedown #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            takedown: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.TAKEDOWN_PROCESS
        };
    }

    if ((match = /^Deleted takedown #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            takedown: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.TAKEDOWN_DELETE
        };
    }

    // ip address & reason are only shown to admin+
    if ((match = /^Created ip ban(?: (?<ip_address>(?:\d{1,3}\.){3}\d{1,3})\nBan reason: (?<reason>.+))?$/.exec(message))) {
        return {
            blame,
            date,
            ipAddress: match.groups!.ip_address ?? null,
            reason:    match.groups!.reason ?? null,
            type:      ActionTypes.IP_BAN_CREATE
        };
    }

    if ((match = /^Removed ip ban(?: (?<ip_address>(?:\d{1,3}\.){3}\d{1,3})\nBan reason: (?<reason>.+))?$/.exec(message))) {
        return {
            blame,
            date,
            ipAddress: match.groups!.ip_address ?? null,
            reason:    match.groups!.reason ?? null,
            type:      ActionTypes.IP_BAN_DELETE
        };
    }

    if ((match = /^Modified ticket #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            ticket: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.TICKET_UPDATE
        };
    }

    if ((match = /^Claimed ticket #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            ticket: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.TICKET_CLAIM
        };
    }

    if ((match = /^Unclaimed ticket #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            ticket: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.TICKET_UNCLAIM
        };
    }

    if ((match = /^Renamed artist page \((?<old>.+) -> (?<new>.+)\)$/.exec(message))) {
        return {
            blame,
            date,
            oldName: String(match.groups!.old),
            newName: String(match.groups!.new),
            type:    ActionTypes.ARTIST_PAGE_RENAME
        };
    }

    if ((match = /^Locked artist page artist #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            artist: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.ARTIST_PAGE_LOCK
        };
    }

    if ((match = /^Unlocked artist page artist #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            artist: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.ARTIST_PAGE_UNLOCK
        };
    }

    if ((match = /^Linked .+ to artist #(?<id>\d+)$/.exec(message))) {
        const user = getUser(messageElement)!;
        return {
            blame,
            date,
            artist: {
                id: Number(match.groups!.id)
            },
            user,
            type: ActionTypes.ARTIST_USER_LINKED
        };
    }

    // user can be missing
    if ((match = /^Unlinked (?:.+)? from artist #(?<id>\d+)$/.exec(message))) {
        const user = getUser(messageElement)!;
        return {
            blame,
            date,
            artist: {
                id: Number(match.groups!.id)
            },
            user,
            type: ActionTypes.ARTIST_USER_UNLINKED
        };
    }

    if ((match = /^Deleted user .+$/.exec(message))) {
        return {
            blame,
            date,
            user: getUser(messageElement)!,
            type: ActionTypes.USER_DELETE
        };
    }

    if (message.startsWith("Banned ")) {
        if (/^Banned .+ permanently$/.test(message)) {
            return {
                blame,
                date,
                duration: null,
                user:     getUser(messageElement)!,
                type:     ActionTypes.USER_BAN
            };
        } else if ((match = /^Banned .+ for (?<days>\d+) days?$/.exec(message))) {
            return {
                blame,
                date,
                duration: Number(match.groups!.days),
                user:     getUser(messageElement)!,
                type:     ActionTypes.USER_BAN
            };
        } else {
            return {
                blame,
                date,
                duration: undefined,
                user:     getUser(messageElement)!,
                type:     ActionTypes.USER_BAN
            };
        }
    }

    if ((match = /^Unbanned .+$/.exec(message))) {
        return {
            blame,
            date,
            user: getUser(messageElement)!,
            type: ActionTypes.USER_UNBAN
        };
    }

    if ((match = /^Changed .+ level from (?<old>.+) to (?<new>.+)$/.exec(message))) {
        return {
            blame,
            date,
            oldLevel: String(match.groups!.old) as UserLevel,
            newLevel: String(match.groups!.new) as UserLevel,
            user:     getUser(messageElement)!,
            type:     ActionTypes.USER_LEVEL_CHANGE
        };
    }

    if ((match = /^Changed .+ flags. Added: \[(?<added>.*)] Removed: \[(?<removed>.*)]$/.exec(message))) {
        return {
            blame,
            date,
            addedFlags:   String(match.groups!.added).split(", ").filter(Boolean) as Array<UserFlag>,
            removedFlags: String(match.groups!.removed).split(", ").filter(Boolean) as Array<UserFlag>,
            user:         getUser(messageElement)!,
            type:         ActionTypes.USER_FLAGS_CHANGE
        };
    }

    editedUser: if ((match = /^Edited (?<name>.+)$/.exec(message))) {
        const user = getUser(messageElement)! as unknown as { id: null; name: string; } | null;
        // since this action is so vage, we make sure we're getting the right info
        if (user?.name !== String(match.groups!.name)) {
            break editedUser;
        }
        return {
            blame,
            date,
            user,
            type: ActionTypes.EDITED_USER
        };
    }

    if ((match = /^Edited blacklist of .+$/.exec(message))) {
        return {
            blame,
            date,
            user: getUser(messageElement)!,
            type: ActionTypes.USER_BLACKLIST_CHANGED
        };
    }

    // internally, changed_user_text & user_text_change are distinct, but we have no way to differentiate them
    if ((match = /^Changed profile text of .+$/.exec(message))) {
        return {
            blame,
            date,
            user: getUser(messageElement)!,
            type: useLegacyActions ? ActionTypes.CHANGED_USER_TEXT : ActionTypes.USER_TEXT_CHANGE
        };
    }

    if ((match = /^Changed upload limit of .+ from (?<old>-?.+) to (?<new>-?.+)$/.exec(message))) {
        return {
            blame,
            date,
            oldLimit: Number(match.groups!.old),
            newLimit: Number(match.groups!.new),
            user:     getUser(messageElement)!,
            type:     ActionTypes.USER_UPLOAD_LIMIT_CHANGE
        };
    }

    if ((match = /^Changed name of .+ from (?<old>.+) to (?<new>.+)$/.exec(message))) {
        return {
            blame,
            date,
            oldName: String(match.groups!.old),
            newName: String(match.groups!.new),
            user:    getUser(messageElement)!,
            type:    ActionTypes.USER_NAME_CHANGE
        };
    }

    if ((match = /^Created (?<type>[Nn](?:egative|eutral)|[Pp]ositive) record #(?<id>\d+) for .+ with reason:/.exec(message))) {
        const type = match.groups!.type;
        return {
            blame,
            date,
            record: {
                id:         Number(match.groups!.id),
                type:       type.toLowerCase() as never,
                htmlReason: htmlReason(messageElement.innerHTML, "with reason:"),
                textReason: textReason(messageElement.textContent!, "with reason:")
            },
            user: getUser(messageElement)!,
            type: useLegacyActions && type.charAt(0) !== type.charAt(0).toUpperCase() ?
                (type === "negative" ? ActionTypes.CREATED_NEGATIVE_RECORD :
                // eslint-disable-next-line unicorn/no-nested-ternary
                    (type === "neutral" ? ActionTypes.CREATED_NEUTRAL_RECORD :
                        (type === "positive" ? ActionTypes.CREATED_POSITIVE_RECORD :
                            ActionTypes.USER_FEEDBACK_CREATE))) : ActionTypes.USER_FEEDBACK_CREATE
        };
    }

    if ((match = /^Edited (?<type>n(?:egative|eutral)|positive) record #(?<id>\d+) for .+ to:/.exec(message))) {
        return {
            blame,
            date,
            record: {
                id:         Number(match.groups!.id),
                type:       match.groups!.type as RecordType,
                htmlReason: htmlReason(messageElement.innerHTML, "to:"),
                textReason: textReason(messageElement.textContent!, "to:")
            },
            user: getUser(messageElement)!,
            type: ActionTypes.USER_FEEDBACK_UPDATE
        };
    }

    if ((match = /^Deleted (?<type>n(?:egative|eutral)|positive) record #(?<id>\d+) for .+ with reason:/.exec(message))) {
        return {
            blame,
            date,
            record: {
                id:         Number(match.groups!.id),
                type:       match.groups!.type as RecordType,
                htmlReason: htmlReason(messageElement.innerHTML, "with reason:"),
                textReason: textReason(messageElement.textContent!, "with reason:")
            },
            user: getUser(messageElement)!,
            type: ActionTypes.USER_FEEDBACK_DELETE
        };
    }

    if ((match = /^Made set #(?<id>\d+) by .+ (?<visibility>public|private)/.exec(message))) {
        return {
            blame,
            date,
            set: {
                id: Number(match.groups!.id)
            },
            visibility: match.groups!.visibility as SetVisibility,
            user:       getUser(messageElement)!,
            type:       ActionTypes.SET_CHANGE_VISIBILITY
        };
    }

    if ((match = /^Edited set #(?<id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            set: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.SET_UPDATE
        };
    }

    if ((match = /^Deleted set #(?<id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            set: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.SET_DELETE
        };
    }

    if ((match = /^Edited comment #(?<id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            comment: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.COMMENT_UPDATE
        };
    }

    if ((match = /^Deleted comment #(?<id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            comment: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.COMMENT_DELETE
        };
    }

    if ((match = /^Hid comment #(?<id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            comment: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.COMMENT_HIDE
        };
    }

    if ((match = /^Unhid comment #(?<id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            comment: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.COMMENT_UNHIDE
        };
    }

    if ((match = /^Deleted forum #(?<id>\d+) in topic #(?<topic_id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            forumPost: {
                id:    Number(match.groups!.id),
                topic: Number(match.groups!.topic_id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_POST_DELETE
        };
    }

    if ((match = /^Edited forum #(?<id>\d+) in topic #(?<topic_id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            forumPost: {
                id:    Number(match.groups!.id),
                topic: Number(match.groups!.topic_id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_POST_UPDATE
        };
    }

    if ((match = /^Hid forum #(?<id>\d+) in topic #(?<topic_id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            forumPost: {
                id:    Number(match.groups!.id),
                topic: Number(match.groups!.topic_id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_POST_HIDE
        };
    }

    if ((match = /^Unhid forum #(?<id>\d+) in topic #(?<topic_id>\d+) by .+/.exec(message))) {
        return {
            blame,
            date,
            forumPost: {
                id:    Number(match.groups!.id),
                topic: Number(match.groups!.topic_id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_POST_UNHIDE
        };
    }

    if ((match = /^Hid topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message))) {
        return {
            blame,
            date,
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_TOPIC_HIDE
        };
    }

    if ((match = /^Unhid topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message))) {
        return {
            blame,
            date,
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_TOPIC_UNHIDE
        };
    }

    if ((match = /^Deleted topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message))) {
        return {
            blame,
            date,
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_TOPIC_DELETE
        };
    }

    if ((match = /^Stickied topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message))) {
        return {
            blame,
            date,
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_TOPIC_STICK
        };
    }

    if ((match = /^Unstickied topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message))) {
        return {
            blame,
            date,
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_TOPIC_UNSTICK
        };
    }

    if ((match = /^Locked topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message))) {
        return {
            blame,
            date,
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_TOPIC_LOCK
        };
    }

    if ((match = /^Unlocked topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message))) {
        return {
            blame,
            date,
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!,
            type: ActionTypes.FORUM_TOPIC_UNLOCK
        };
    }

    if ((match = /^Created forum category #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            forumCategory: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.FORUM_CATEGORY_CREATE
        };
    }

    if ((match = /^Edited forum category #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            forumCategory: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.FORUM_CATEGORY_UPDATE
        };
    }

    if ((match = /^Deleted forum category #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            forumCategory: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.FORUM_CATEGORY_DELETE
        };
    }

    if ((match = /^Edited blip #(?<id>\d+) by .+$/.exec(message))) {
        return {
            blame,
            date,
            blip: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.BLIP_UPDATE
        };
    }

    if ((match = /^Deleted blip #(?<id>\d+)(?: by .+)?$/.exec(message))) {
        return {
            blame,
            date,
            blip: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement) as unknown as { id: null; name: string; } | null,
            type: ActionTypes.BLIP_DELETE
        };
    }

    if ((match = /^Hid blip #(?<id>\d+)(?: by .+)?$/.exec(message))) {
        return {
            blame,
            date,
            blip: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement) as unknown as { id: null; name: string; } | null,
            type: ActionTypes.BLIP_HIDE
        };
    }

    if ((match = /^Unhid blip #(?<id>\d+) by .+?$/.exec(message))) {
        return {
            blame,
            date,
            blip: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!,
            type: ActionTypes.BLIP_UNHIDE
        };
    }

    // This technically has a variable structure, but I can't see anywhere where it's actually different
    if ((match = /^Created(?: tag alias){2} #(?<id>\d+): (?<antecedent>.+) -> (?<consequent>.+)$/.exec(message))) {
        return {
            blame,
            date,
            tagAlias: {
                antecedent: match.groups!.antecedent,
                consequent: match.groups!.consequent,
                id:         Number(match.groups!.id)
            },
            type: ActionTypes.TAG_ALIAS_CREATE
        };
    }

    // tag_alias_approve & tag_alias_delete should be here, but as far as I can tell they aren't actually used anywhere

    if (((match = /^Updated(?: tag alias){2} #(?<id>\d+): (?<antecedent>.+) -> (?<consequent>.+)/.exec(message)))) {
        const changes = message.split("\n")[1]?.split(", ") ?? [];
        const updates: {
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
        } = {};
        let submatch: RegExpExecArray | null;
        for (const change of changes) {
            if ((submatch = /^changed antecedent_name from "(?<old>.+)" to "(?<new>.+)"$/.exec(change))) {
                updates.antecedentName = {
                    new: submatch.groups!.new,
                    old: submatch.groups!.old
                };
                continue;
            }

            if ((submatch = /^set approver_id to "(?<approver_id>\d+)"$/.exec(change))) {
                updates.approverID = Number(submatch.groups!.approver_id);
                continue;
            }

            if ((submatch = /^changed consequent_name from "(?<old>.+)" to "(?<new>.+)"$/.exec(change))) {
                updates.consequentName = {
                    new: submatch.groups!.new,
                    old: submatch.groups!.old
                };
                continue;
            }

            if ((submatch = /^set forum_post_id to "(?<forum_post_id>\d+)"$/.exec(change))) {
                updates.forumPostID = Number(submatch.groups!.forum_post_id);
                continue;
            }

            if ((submatch = /^set forum_topic_id to "(?<forum_topic_id>\d+)"$/.exec(change))) {
                updates.forumTopicID = Number(submatch.groups!.forum_topic_id);
                continue;
            }

            if ((submatch = /^changed post_count from "(?<old>\d+)" to "(?<new>\d+)"$/.exec(change))) {
                updates.postCount = {
                    new: Number(submatch.groups!.new),
                    old: Number(submatch.groups!.old)
                };
                continue;
            }

            if ((submatch = /^changed status from "(?<old>.+)" to "(?<new>.+)"$/.exec(change))) {
                updates.status = {
                    new: submatch.groups!.new as TagStatus,
                    old: submatch.groups!.old as TagStatus
                };
                continue;
            }
        }
        return {
            blame,
            date,
            tagAlias: {
                antecedent: match.groups!.antecedent,
                consequent: match.groups!.consequent,
                id:         Number(match.groups!.id),
                updates
            },
            type: ActionTypes.TAG_ALIAS_UPDATE
        };
    }

    // This technically has a variable structure, but I can't see anywhere where it's actually different
    if ((match = /^Created(?: tag implication){2} #(?<id>\d+): (?<antecedent>.+) -> (?<consequent>.+)$/.exec(message))) {
        return {
            blame,
            date,
            tagImplication: {
                id:         Number(match.groups!.id),
                antecedent: match.groups!.antecedent,
                consequent: match.groups!.consequent
            },
            type: ActionTypes.TAG_IMPLICATION_CREATE
        };
    }

    // tag_implication_approve & tag_implication_delete should be here, but as far as I can tell they aren't actually used anywhere


    if (((match = /^Updated(?: tag implication){2} #(?<id>\d+): (?<antecedent>.+) -> (?<consequent>.+)/.exec(message)))) {
        const changes = message.split("\n")[1]?.split(", ") ?? [];
        const updates: {
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
        } = {};
        let submatch: RegExpExecArray | null;
        for (const change of changes) {

            if ((submatch = /^changed antecedent_name from "(?<old>.+)" to "(?<new>.+)"$/.exec(change))) {
                updates.antecedentName = {
                    new: submatch.groups!.new,
                    old: submatch.groups!.old
                };
                continue;
            }

            if ((submatch = /^set approver_id to "(?<approver_id>\d+)"$/.exec(change))) {
                updates.approverID = Number(submatch.groups!.approver_id);
                continue;
            }

            if ((submatch = /^changed consequent_name from "(?<old>.+)" to "(?<new>.+)"$/.exec(change))) {
                updates.consequentName = {
                    new: submatch.groups!.new,
                    old: submatch.groups!.old
                };
                continue;
            }

            if ((submatch = /^set forum_post_id to "(?<forum_post_id>\d+)"$/.exec(change))) {
                updates.forumPostID = Number(submatch.groups!.forum_post_id);
                continue;
            }

            if ((submatch = /^set forum_topic_id to "(?<forum_topic_id>\d+)"$/.exec(change))) {
                updates.forumTopicID = Number(submatch.groups!.forum_topic_id);
                continue;
            }


            if ((submatch = /^changed status from "(?<old>.+)" to "(?<new>.+)"$/.exec(change))) {
                updates.status = {
                    new: submatch.groups!.new as TagStatus,
                    old: submatch.groups!.old as TagStatus
                };
                continue;
            }
        }
        return {
            blame,
            date,
            tagImplication: {
                antecedent: match.groups!.antecedent,
                consequent: match.groups!.consequent,
                id:         Number(match.groups!.id),
                updates
            },
            type: ActionTypes.TAG_IMPLICATION_UPDATE
        };
    }

    if ((match = /^Created flag reason #(?<id>\d+) \((?<reason>.+)\)$/.exec(message))) {
        return {
            blame,
            date,
            flagReason: {
                id:     Number(match.groups!.id),
                reason: match.groups!.reason
            },
            type: ActionTypes.CREATED_FLAG_REASON
        };
    }

    if ((match = /^Edited flag reason #(?<id>\d+) \((?<reason>.+)\)/.exec(message))) {
        return {
            blame,
            date,
            flagReason: {
                id:     Number(match.groups!.id),
                reason: match.groups!.reason
            },
            type: ActionTypes.EDITED_FLAG_REASON
        };
    }

    if ((match = /^Deleted flag reason #(?<id>\d+) \((?<reason>.+)\)$/.exec(message))) {
        return {
            blame,
            date,
            flagReason: {
                id:     Number(match.groups!.id),
                reason: match.groups!.reason
            },
            type: ActionTypes.DELETED_FLAG_REASON
        };
    }

    if ((match = /^Created post report reason (?<reason>.+)$/.exec(message))) {
        return {
            blame,
            date,
            reportReason: {
                reason: match.groups!.reason
            },
            type: ActionTypes.REPORT_REASON_CREATE
        };
    }

    if ((match = /^Deleted post report reason (?<reason>.+) by .+$/.exec(message))) {
        return {
            blame,
            date,
            reportReason: {
                reason: match.groups!.reason
            },
            user: getUser(messageElement)!,
            type: ActionTypes.REPORT_REASON_DELETE
        };
    }

    if ((match = /^Edited post report reason (?<old_reason>.+) to (?<new_reason>.+)$/.exec(message))) {
        return {
            blame,
            date,
            reportReason: {
                oldReason: match.groups!.old_reason,
                newReason: match.groups!.new_reason
            },
            type: ActionTypes.REPORT_REASON_UPDATE
        };
    }

    // this has different values depending on if the user is an admin (showing pattern instead of note), or if the whitelist entry is hidden (showing nothing)
    if ((match = /^Created whitelist entry(?: '(?<entry>.+)')?$/.exec(message))) {
        return {
            blame,
            date,
            whitelist: {
                entry: match.groups?.entry
            },
            type: ActionTypes.UPLOAD_WHITELIST_CREATE
        };
    }

    // this will only ever be shown to admins
    if ((match = /^Edited whitelist entry '(?<old_pattern>.+)' -> '(?<new_pattern>.+)'$/.exec(message))) {
        return {
            blame,
            date,
            whitelist: {
                oldPattern: match.groups!.old_pattern,
                newPattern: match.groups!.new_pattern
            },
            type: ActionTypes.UPLOAD_WHITELIST_UPDATE
        };
    }

    // this has different values depending on if the user is an admin (showing pattern instead of note), or if the whitelist entry is hidden (showing nothing)
    if ((match = /^Edited whitelist entry(?: '(?<entry>.+)')?$/.exec(message))) {
        return {
            blame,
            date,
            whitelist: {
                entry: match.groups?.entry
            },
            type: ActionTypes.UPLOAD_WHITELIST_UPDATE
        };
    }

    // this has different values depending on if the user is an admin (showing pattern instead of note), or if the whitelist entry is hidden (showing nothing)
    if ((match = /^Deleted whitelist entry(?: '(?<entry>.+)')?$/.exec(message))) {
        return {
            blame,
            date,
            whitelist: {
                entry: match.groups?.entry
            },
            type: ActionTypes.UPLOAD_WHITELIST_DELETE
        };
    }

    if ((match = /^Created help entry (?<name>.+) \((?<wiki_page>.+)\)/.exec(message))) {
        return {
            blame,
            date,
            help: {
                name:     match.groups!.name,
                wikiPage: match.groups!.wiki_page
            },
            type: ActionTypes.HELP_CREATE
        };
    }

    if ((match = /^Edited help entry (?<name>.+) \((?<wiki_page>.+)\)/.exec(message))) {
        return {
            blame,
            date,
            help: {
                name:     match.groups!.name,
                wikiPage: match.groups!.wiki_page
            },
            type: ActionTypes.HELP_UPDATE
        };
    }

    if ((match = /^Deleted help entry (?<name>.+) \((?<wiki_page>.+)\)/.exec(message))) {
        return {
            blame,
            date,
            help: {
                name:     match.groups!.name,
                wikiPage: match.groups!.wiki_page
            },
            type: ActionTypes.HELP_DELETE
        };
    }

    if ((match = /^Deleted wiki page (?<name>.+)/.exec(message))) {
        return {
            blame,
            date,
            wikiPage: {
                name: match.groups!.name
            },
            type: ActionTypes.WIKI_PAGE_DELETE
        };
    }

    if ((match = /^Locked wiki page (?<name>.+)/.exec(message))) {
        return {
            blame,
            date,
            wikiPage: {
                name: match.groups!.name
            },
            type: ActionTypes.WIKI_PAGE_LOCK
        };
    }

    if ((match = /^Unlocked wiki page (?<name>.+)/.exec(message))) {
        return {
            blame,
            date,
            wikiPage: {
                name: match.groups!.name
            },
            type: ActionTypes.WIKI_PAGE_UNLOCK
        };
    }

    if ((match = /^Renamed wiki page \((?<old_name>.+) → (?<new_name>.+)\)/.exec(message))) {
        return {
            blame,
            date,
            wikiPage: {
                oldName: match.groups!.old_name,
                newName: match.groups!.new_name
            },
            type: ActionTypes.WIKI_PAGE_RENAME
        };
    }

    if ((match = /^Mass updated (?<old_tag>.+) -> (?<new_tag>.+)$/.exec(message))) {
        return {
            blame,
            date,
            oldTag: match.groups!.old_tag,
            newTag: match.groups!.new_tag,
            type:   ActionTypes.MASS_UPDATE
        };
    }

    if ((match = /^Nuked tag (?<tag>.+)$/.exec(message))) {
        return {
            blame,
            date,
            tag:  match.groups!.tag,
            type: ActionTypes.NUKE_TAG
        };
    }

    if ((match = /^Created mascot #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            mascot: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.MASCOT_CREATE
        };
    }

    if ((match = /^Updated mascot #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            mascot: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.MASCOT_UPDATE
        };
    }

    if ((match = /^Deleted mascot #(?<id>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            mascot: {
                id: Number(match.groups!.id)
            },
            type: ActionTypes.MASCOT_DELETE
        };
    }

    if ((match = /^Processed bulk revert for .+ by .+$/.exec(message))) {
        return {
            blame,
            date,
            user: getUser(messageElement)!,
            type: ActionTypes.BULK_REVERT
        };
    }

    if ((match = /^Moves favorites from post #(?<old_post>\d+) to post #(?<new_post>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            favorites: {
                oldPost: Number(match.groups!.old_post),
                newPost: Number(match.groups!.new_post)
            },
            type: ActionTypes.POST_MOVE_FAVORITES
        };
    }

    if ((match = /^Deleted post #(?<post>\d+) with reason:/.exec(message))) {
        return {
            blame,
            date,
            post: {
                id:         Number(match.groups!.post),
                htmlReason: htmlReason(messageElement.innerHTML, "with reason:"),
                textReason: textReason(messageElement.textContent!, "with reason:")
            },
            type: ActionTypes.POST_DELETE
        };
    }

    if ((match = /^Undeleted post #(?<post>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            post: {
                id: Number(match.groups!.post)
            },
            type: ActionTypes.POST_UNDELETE
        };
    }

    if ((match = /^Destroyed post #(?<post>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            post: {
                id: Number(match.groups!.post)
            },
            type: ActionTypes.POST_DESTROY
        };
    }

    if ((match = /^Post rating was (?<action>locked|unlocked) on post #(?<post>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            post: {
                id:     Number(match.groups!.post),
                action: match.groups!.action as "locked" | "unlocked"
            },
            type: ActionTypes.POST_RATING_LOCK
        };
    }

    if ((match = /^Unapproved post #(?<post>\d+)$/.exec(message))) {
        return {
            blame,
            date,
            post: {
                id: Number(match.groups!.post)
            },
            type: ActionTypes.POST_UNAPPROVE
        };
    }

    if ((match = /^Post replacement for post #(?<post>\d+) was accepted$/.exec(message))) {
        return {
            blame,
            date,
            post: {
                id: Number(match.groups!.post)
            },
            type: ActionTypes.POST_REPLACEMENT_ACCEPT
        };
    }

    if ((match = /^Post replacement for post #(?<post>\d+) was rejected$/.exec(message))) {
        return {
            blame,
            date,
            post: {
                id: Number(match.groups!.post)
            },
            type: ActionTypes.POST_REPLACEMENT_REJECT
        };
    }

    if ((match = /^Post replacement for post #(?<post>\d+) was deleted$/.exec(message))) {
        return {
            blame,
            date,
            post: {
                id: Number(match.groups!.post)
            },
            type: ActionTypes.POST_REPLACEMENT_DELETE
        };
    }

    throw new Error(`Unknown action: ${message} (${messageElement.innerHTML})`);
}
