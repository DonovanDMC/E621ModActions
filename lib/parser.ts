import { ActionTypes } from "./Constants.js";
import type {
    AnyAction,
    JSONModAction,
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

function getUserName(element: HTMLTableCellElement, id: number) {
    const userElement = element.querySelector<HTMLAnchorElement>(`a[href^='/users/${id}']`);
    if (!userElement) {
        return {
            id,
            name: null
        };
    }
    return {
        id,
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

export default function parse(json: JSONModAction, element: HTMLTableRowElement): AnyAction {
    const [, userElement, messageElement] = element.querySelectorAll("td");
    const blame = getUserName(userElement, json.creator_id), date = new Date(json.created_at), message = messageElement.textContent!;
    const data = ParserMap[json.action]?.(message, messageElement);

    if (data === undefined) {
        throw new Error(`Unknown action: ${message} (${messageElement.innerHTML})`);
    }

    return {
        type: json.action,
        blame,
        date,
        id:   json.id,
        ...(data === null ? {} : data)
    } as never;
}

export const ParserMap = {
    [ActionTypes.POOL_DELETE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Deleted pool #(?<id>\d+) \(named (?<name>.+)\) by .+$/.exec(message);

        return match === null ? null : {
            user: getUser(messageElement)!,
            pool: {
                id:   Number(match.groups!.id),
                name: match.groups!.name
            }
        };
    },
    [ActionTypes.TAKEDOWN_PROCESS]: (message: string) => {
        const match = /^Completed takedown #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            takedown: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.TAKEDOWN_DELETE]: (message: string) => {
        const match = /^Deleted takedown #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            takedown: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.IP_BAN_CREATE]: (message: string) => {
        const match = /^Created ip ban(?: (?<ip_address>(?:\d{1,3}\.){3}\d{1,3})\nBan reason: (?<reason>.+))?$/.exec(message);

        return match === null ? null : {
            ipAddress: match.groups!.ip_address ?? null,
            reason:    match.groups!.reason ?? null
        };
    },
    [ActionTypes.IP_BAN_DELETE]: (message: string) => {
        const match = /^Removed ip ban(?: (?<ip_address>(?:\d{1,3}\.){3}\d{1,3})\nBan reason: (?<reason>.+))?$/.exec(message);

        return match === null ? null : {
            ipAddress: match.groups!.ip_address ?? null,
            reason:    match.groups!.reason ?? null
        };
    },
    [ActionTypes.TICKET_UPDATE]: (message: string) => {
        const match = /^Modified ticket #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            ticket: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.TICKET_CLAIM]: (message: string) => {
        const match = /^Claimed ticket #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            ticket: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.TICKET_UNCLAIM]: (message: string) => {
        const match = /^Unclaimed ticket #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            ticket: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.ARTIST_PAGE_RENAME]: (message: string) => {
        const match = /^Renamed artist page \((?<old>.+) -> (?<new>.+)\)$/.exec(message);

        return match === null ? null : {
            oldName: String(match.groups!.old),
            newName: String(match.groups!.new)
        };
    },
    [ActionTypes.ARTIST_PAGE_LOCK]: (message: string) => {
        const match = /^Locked artist page artist #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            artist: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.ARTIST_PAGE_UNLOCK]: (message: string) => {
        const match = /^Unlocked artist page artist #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            artist: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.ARTIST_USER_LINKED]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Linked .+ to artist #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            artist: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.ARTIST_USER_UNLINKED]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Unlinked (?:.+)? from artist #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            artist: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)
        };
    },
    [ActionTypes.USER_DELETE]: (message: string, messageElement: HTMLTableCellElement) => ({
        user: getUser(messageElement)!
    }),
    [ActionTypes.USER_BAN]: (message: string, messageElement: HTMLTableCellElement) => {
        let match: RegExpExecArray | null;
        if (/^Banned .+ permanently$/.test(message)) {
            return {
                duration: null,
                user:     getUser(messageElement)!
            };
        } else if ((match = /^Banned .+ for (?<days>\d+) days?$/.exec(message))) {
            return {
                duration: Number(match.groups!.days),
                user:     getUser(messageElement)!
            };
        } else {
            return {
                duration: undefined,
                user:     getUser(messageElement)!
            };
        }
    },
    [ActionTypes.USER_UNBAN]: (message: string, messageElement: HTMLTableCellElement) => ({
        user: getUser(messageElement)!
    }),
    [ActionTypes.USER_LEVEL_CHANGE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Changed .+ level from (?<old>.+) to (?<new>.+)$/.exec(message);

        return match === null ? null : {
            oldLevel: String(match.groups!.old) as UserLevel,
            newLevel: String(match.groups!.new) as UserLevel,
            user:     getUser(messageElement)!
        };
    },
    [ActionTypes.USER_FLAGS_CHANGE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Changed .+ flags. Added: \[(?<added>.*)] Removed: \[(?<removed>.*)]$/.exec(message);

        return match === null ? null : {
            addedFlags:   String(match.groups!.added).split(", ").filter(Boolean) as Array<UserFlag>,
            removedFlags: String(match.groups!.removed).split(", ").filter(Boolean) as Array<UserFlag>,
            user:         getUser(messageElement)!
        };
    },
    [ActionTypes.EDITED_USER]: (message: string, messageElement: HTMLTableCellElement) => ({
        user: getUser(messageElement)!
    }),
    [ActionTypes.USER_BLACKLIST_CHANGED]: (message: string, messageElement: HTMLTableCellElement) => ({
        user: getUser(messageElement)!
    }),
    [ActionTypes.USER_TEXT_CHANGE]: (message: string, messageElement: HTMLTableCellElement) => ({
        user: getUser(messageElement)!
    }),
    [ActionTypes.CHANGED_USER_TEXT]: (message: string, messageElement: HTMLTableCellElement) => ({
        user: getUser(messageElement)!
    }),
    [ActionTypes.USER_UPLOAD_LIMIT_CHANGE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Changed upload limit of .+ from (?<old>-?.+) to (?<new>-?.+)$/.exec(message);

        return match === null ? null : {
            oldLimit: Number(match.groups!.old),
            newLimit: Number(match.groups!.new),
            user:     getUser(messageElement)!
        };
    },
    [ActionTypes.USER_NAME_CHANGE]: (message: string, messageElement: HTMLTableCellElement) => ({
        user: getUser(messageElement)!
    }),
    [ActionTypes.USER_FEEDBACK_CREATE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^created (?<type>negative|neutral|positive) record #(?<id>\d+) for .+ with reason:/i.exec(message);

        return match === null ? null : {
            record: {
                id:         Number(match.groups!.id),
                type:       match.groups!.type.toLowerCase(),
                htmlReason: htmlReason(messageElement.innerHTML, "with reason:"),
                textReason: textReason(messageElement.textContent!, "with reason:")
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.USER_FEEDBACK_UPDATE]: (message: string, messageElement: HTMLTableCellElement) => {
        let match: RegExpExecArray | null;
        // legacy
        if ((match = /^Edited (?<type>negative|neutral|positive) record #(?<id>\d+) for .+ to:/.exec(message))) {
            return {
                record: {
                    id:         Number(match.groups!.id),
                    type:       match.groups!.type.toLowerCase(),
                    htmlReason: htmlReason(messageElement.innerHTML, "to:"),
                    textReason: textReason(messageElement.textContent!, "to:")
                },
                user: getUser(messageElement)!
            };
        } else if ((match = /^Edited record #(?<id>\d+) for .+/.exec(message))) {
            const typeMatch = /Changed type from (?<old>negative|neutral|positive) to (?<new>negative|neutral|positive)/.exec(message);
            const reasonMatch = /Changed reason: \[section=Old](?<old>.+)\[\/section] \[section=New](?<new>.+)\[\/section]/.exec(message);

            const data = {
                record: {
                    id: Number(match.groups!.id)
                },
                user: getUser(messageElement)!
            };

            if (typeMatch) {
                Object.assign(data.record, {
                    oldType: typeMatch.groups!.old,
                    newType: typeMatch.groups!.new
                });
            }

            if (reasonMatch) {
                Object.assign(data.record, {
                    oldReason: reasonMatch.groups!.old,
                    newReason: reasonMatch.groups!.new
                });
            }

            return data;
        } else {
            return null;
        }
    },
    [ActionTypes.USER_FEEDBACK_DELETE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Deleted (?<type>negative|neutral|positive) record #(?<id>\d+) for .+ with reason:/.exec(message);

        return match === null ? null : {
            record: {
                id:         Number(match.groups!.id),
                type:       match.groups!.type,
                htmlReason: htmlReason(messageElement.innerHTML, "with reason:"),
                textReason: textReason(messageElement.textContent!, "with reason:")
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.CREATED_POSITIVE_RECORD]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Created positive record #(?<id>\d+) for .+ with reason:/.exec(message);

        return match === null ? null : {
            record: {
                id:         Number(match.groups!.id),
                type:       "positive",
                htmlReason: htmlReason(messageElement.innerHTML, "with reason:"),
                textReason: textReason(messageElement.textContent!, "with reason:")
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.CREATED_NEUTRAL_RECORD]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Created neutral record #(?<id>\d+) for .+ with reason:/.exec(message);

        return match === null ? null : {
            record: {
                id:         Number(match.groups!.id),
                type:       "neutral",
                htmlReason: htmlReason(messageElement.innerHTML, "with reason:"),
                textReason: textReason(messageElement.textContent!, "with reason:")
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.CREATED_NEGATIVE_RECORD]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Created negative record #(?<id>\d+) for .+ with reason:/.exec(message);

        return match === null ? null : {
            record: {
                id:         Number(match.groups!.id),
                type:       "negative",
                htmlReason: htmlReason(messageElement.innerHTML, "with reason:"),
                textReason: textReason(messageElement.textContent!, "with reason:")
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.SET_CHANGE_VISIBILITY]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Made set #(?<id>\d+) by .+ (?<visibility>public|private)$/.exec(message);

        return match === null ? null : {
            set: {
                id: Number(match.groups!.id)
            },
            visibility: match.groups!.visibility,
            user:       getUser(messageElement)!
        };
    },
    [ActionTypes.SET_UPDATE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Edited set #(?<id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            set: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.SET_DELETE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Deleted set #(?<id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            set: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.COMMENT_UPDATE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Edited comment #(?<id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            comment: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.COMMENT_DELETE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Deleted comment #(?<id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            comment: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.COMMENT_HIDE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Hid comment #(?<id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            comment: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.COMMENT_UNHIDE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Unhid comment #(?<id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            comment: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_POST_DELETE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Deleted forum #(?<id>\d+) in topic #(?<topic_id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            forumPost: {
                id:    Number(match.groups!.id),
                topic: Number(match.groups!.topic_id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_POST_UPDATE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Edited forum #(?<id>\d+) in topic #(?<topic_id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            forumPost: {
                id:    Number(match.groups!.id),
                topic: Number(match.groups!.topic_id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_POST_HIDE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Hid forum #(?<id>\d+) in topic #(?<topic_id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            forumPost: {
                id:    Number(match.groups!.id),
                topic: Number(match.groups!.topic_id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_POST_UNHIDE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Unhid forum #(?<id>\d+) in topic #(?<topic_id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            forumPost: {
                id:    Number(match.groups!.id),
                topic: Number(match.groups!.topic_id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_TOPIC_HIDE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Hid topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message);

        return match === null ? null : {
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_TOPIC_UNHIDE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Unhid topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message);

        return match === null ? null : {
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_TOPIC_DELETE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Deleted topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message);

        return match === null ? null : {
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_TOPIC_STICK]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Stickied topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message);

        return match === null ? null : {
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_TOPIC_UNSTICK]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Unstickied topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message);

        return match === null ? null : {
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_TOPIC_LOCK]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Locked topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message);

        return match === null ? null : {
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_TOPIC_UNLOCK]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Unlocked topic #(?<id>\d+) \(with title (?<title>.+)\) by .+$/.exec(message);

        return match === null ? null : {
            forumTopic: {
                id:    Number(match.groups!.id),
                title: match.groups!.title
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.FORUM_CATEGORY_CREATE]: (message: string) => {
        const match = /^Created forum category #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            forumCategory: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.FORUM_CATEGORY_UPDATE]: (message: string) => {
        const match = /^Edited forum category #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            forumCategory: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.FORUM_CATEGORY_DELETE]: (message: string) => {
        const match = /^Deleted forum category #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            forumCategory: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.BLIP_UPDATE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Edited blip #(?<id>\d+) by .+$/.exec(message);

        return match === null ? null : {
            blip: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.BLIP_DELETE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Deleted blip #(?<id>\d+)(?: by .+)?$/.exec(message);

        return match === null ? null : {
            blip: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)
        };
    },
    [ActionTypes.BLIP_HIDE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Hid blip #(?<id>\d+)(?: by .+)?$/.exec(message);

        return match === null ? null : {
            blip: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)
        };
    },
    [ActionTypes.BLIP_UNHIDE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Unhid blip #(?<id>\d+)(?: by .+)?$/.exec(message);

        return match === null ? null : {
            blip: {
                id: Number(match.groups!.id)
            },
            user: getUser(messageElement)
        };
    },
    // This technically has a variable structure, but I can't see anywhere where it's actually different
    [ActionTypes.TAG_ALIAS_CREATE]: (message: string) => {
        const match = /^Created(?: tag alias){2} #(?<id>\d+): (?<antecedent>.+) -> (?<consequent>.+)$/.exec(message);

        return match === null ? null : {
            tagAlias: {
                antecedent: match.groups!.antecedent,
                consequent: match.groups!.consequent,
                id:         Number(match.groups!.id)
            }
        };
    },
    // tag_alias_approve & tag_alias_delete should be here, but as far as I can tell they aren't actually used anywhere
    [ActionTypes.TAG_ALIAS_UPDATE]: (message: string) => {
        const match = /^Updated(?: tag alias){2} #(?<id>\d+): (?<antecedent>.+) -> (?<consequent>.+)/.exec(message);

        if (match === null) {
            return null;
        }

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

            return {
                tagAlias: {
                    antecedent: match.groups!.antecedent,
                    consequent: match.groups!.consequent,
                    id:         Number(match.groups!.id),
                    updates
                }
            };
        }

        return {
            tagAlias: {
                antecedent: match.groups!.antecedent,
                consequent: match.groups!.consequent,
                id:         Number(match.groups!.id),
                updates
            }
        };
    },
    // This technically has a variable structure, but I can't see anywhere where it's actually different
    [ActionTypes.TAG_IMPLICATION_CREATE]: (message: string) => {
        const match = /^Created(?: tag implication){2} #(?<id>\d+): (?<antecedent>.+) -> (?<consequent>.+)$/.exec(message);

        return match === null ? null : {
            tagImplication: {
                antecedent: match.groups!.antecedent,
                consequent: match.groups!.consequent,
                id:         Number(match.groups!.id)
            }
        };
    },
    // tag_implication_approve & tag_implication_delete should be here, but as far as I can tell they aren't actually used anywhere
    [ActionTypes.TAG_IMPLICATION_UPDATE]: (message: string) => {
        const match = /^Updated(?: tag implication){2} #(?<id>\d+): (?<antecedent>.+) -> (?<consequent>.+)/.exec(message);

        if (match === null) {
            return null;
        }


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
            tagImplication: {
                antecedent: match.groups!.antecedent,
                consequent: match.groups!.consequent,
                id:         Number(match.groups!.id),
                updates
            }
        };
    },
    [ActionTypes.CREATED_FLAG_REASON]: (message: string) => {
        const match = /^Created flag reason #(?<id>\d+) \((?<reason>.+)\)$/.exec(message);

        return match === null ? null : {
            flagReason: {
                id:     Number(match.groups!.id),
                reason: match.groups!.reason
            }
        };
    },
    [ActionTypes.EDITED_FLAG_REASON]: (message: string) => {
        const match = /^Edited flag reason #(?<id>\d+) \((?<reason>.+)\)$/.exec(message);

        return match === null ? null : {
            flagReason: {
                id:     Number(match.groups!.id),
                reason: match.groups!.reason
            }
        };
    },
    [ActionTypes.DELETED_FLAG_REASON]: (message: string) => {
        const match = /^Deleted flag reason #(?<id>\d+) \((?<reason>.+)\)$/.exec(message);

        return match === null ? null : {
            flagReason: {
                id:     Number(match.groups!.id),
                reason: match.groups!.reason
            }
        };
    },
    [ActionTypes.REPORT_REASON_CREATE]: (message: string) => {
        const match = /^Created post report reason (?<reason>.+)$/.exec(message);

        return match === null ? null : {
            reportReason: {
                reason: match.groups!.reason
            }
        };
    },
    [ActionTypes.REPORT_REASON_DELETE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Deleted post report reason (?<reason>.+) by .+$/.exec(message);

        return match === null ? null : {
            reportReason: {
                reason: match.groups!.reason
            },
            user: getUser(messageElement)!
        };
    },
    [ActionTypes.REPORT_REASON_UPDATE]: (message: string) => {
        const match = /^Edited post report reason (?<old_reason>.+) to (?<new_reason>.+)$/.exec(message);

        return match === null ? null : {
            reportReason: {
                oldReason: match.groups!.old_reason,
                newReason: match.groups!.new_reason
            }
        };
    },
    // this has different values depending on if the user is an admin (showing pattern instead of note), or if the whitelist entry is hidden (showing nothing)
    [ActionTypes.UPLOAD_WHITELIST_CREATE]: (message: string) => {
        const match = /^Created whitelist entry(?: '(?<entry>.+)')?$/.exec(message);

        return match === null ? null : {
            whitelist: {
                entry: match.groups?.entry
            }
        };
    },
    [ActionTypes.UPLOAD_WHITELIST_UPDATE]: (message: string) => {
        let match: RegExpExecArray | null;
        // admin only
        if ((match = /^Edited whitelist entry '(?<old_pattern>.+)' -> '(?<new_pattern>.+)'$/.exec(message))) {
            return {
                whitelist: {
                    oldPattern: match.groups!.old_pattern,
                    newPattern: match.groups!.new_pattern
                }
            };
            // this has different values depending on if the user is an admin (showing pattern instead of note), or if the whitelist entry is hidden (showing nothing)
        } else if ((match = /^Edited whitelist entry(?: '(?<entry>.+)')?$/.exec(message))) {
            return {
                whitelist: {
                    entry: match.groups?.entry
                }
            };
        } else {
            return null;
        }
    },
    // this has different values depending on if the user is an admin (showing pattern instead of note), or if the whitelist entry is hidden (showing nothing)
    [ActionTypes.UPLOAD_WHITELIST_DELETE]: (message: string) => {
        const match = /^Deleted whitelist entry(?: '(?<entry>.+)')?$/.exec(message);

        return match === null ? null : {
            whitelist: {
                entry: match.groups?.entry
            }
        };
    },
    [ActionTypes.HELP_CREATE]: (message: string) => {
        const match = /^Created help entry (?<name>.+) \((?<wiki_page>.+)\)$/.exec(message);

        return match === null ? null : {
            help: {
                name:     match.groups!.name,
                wikiPage: match.groups!.wiki_page
            }
        };
    },
    [ActionTypes.HELP_UPDATE]: (message: string) => {
        const match = /^Edited help entry (?<name>.+) \((?<wiki_page>.+)\)$/.exec(message);

        return match === null ? null : {
            help: {
                name:     match.groups!.name,
                wikiPage: match.groups!.wiki_page
            }
        };
    },
    [ActionTypes.HELP_DELETE]: (message: string) => {
        const match = /^Deleted help entry (?<name>.+) \((?<wiki_page>.+)\)$/.exec(message);

        return match === null ? null : {
            help: {
                name:     match.groups!.name,
                wikiPage: match.groups!.wiki_page
            }
        };
    },
    [ActionTypes.WIKI_PAGE_DELETE]: (message: string) => {
        const match = /^Deleted wiki page (?<name>.+)$/.exec(message);

        return match === null ? null : {
            wikiPage: {
                name: match.groups!.name
            }
        };
    },
    [ActionTypes.WIKI_PAGE_LOCK]: (message: string) => {
        const match = /^Locked wiki page (?<name>.+)$/.exec(message);

        return match === null ? null : {
            wikiPage: {
                name: match.groups!.name
            }
        };
    },
    [ActionTypes.WIKI_PAGE_UNLOCK]: (message: string) => {
        const match = /^Unlocked wiki page (?<name>.+)$/.exec(message);

        return match === null ? null : {
            wikiPage: {
                name: match.groups!.name
            }
        };
    },
    [ActionTypes.WIKI_PAGE_RENAME]: (message: string) => {
        const match = /^Renamed wiki page \((?<old_name>.+) → (?<new_name>.+)\)$/.exec(message);

        return match === null ? null : {
            wikiPage: {
                oldName: match.groups!.old_name,
                newName: match.groups!.new_name
            }
        };
    },
    [ActionTypes.MASS_UPDATE]: (message: string) => {
        const match = /^Mass updated (?<old_tag>.+) -> (?<new_tag>.+)$/.exec(message);

        return match === null ? null : {
            oldTag: match.groups!.old_tag,
            newTag: match.groups!.new_tag
        };
    },
    [ActionTypes.NUKE_TAG]: (message: string) => {
        const match = /^Nuked tag (?<tag>.+)$/.exec(message);

        return match === null ? null : {
            tag: match.groups!.tag
        };
    },
    [ActionTypes.MASCOT_CREATE]: (message: string) => {
        const match = /^Created mascot #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            mascot: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.MASCOT_UPDATE]: (message: string) => {
        const match = /^Updated mascot #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            mascot: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.MASCOT_DELETE]: (message: string) => {
        const match = /^Deleted mascot #(?<id>\d+)$/.exec(message);

        return match === null ? null : {
            mascot: {
                id: Number(match.groups!.id)
            }
        };
    },
    [ActionTypes.POST_MOVE_FAVORITES]: (message: string) => {
        const match = /^Moves favorites from post #(?<old_post>\d+) to post #(?<new_post>\d+)$/.exec(message);

        return match === null ? null : {
            favorites: {
                oldPost: Number(match.groups!.old_post),
                newPost: Number(match.groups!.new_post)
            }
        };
    },
    [ActionTypes.POST_DELETE]: (message: string, messageElement: HTMLTableCellElement) => {
        const match = /^Deleted post #(?<post>\d+) with reason:/.exec(message);

        return match === null ? null : {
            post: {
                id:         Number(match.groups!.post),
                htmlReason: htmlReason(messageElement.innerHTML, "with reason:"),
                textReason: textReason(messageElement.textContent!, "with reason:")
            }
        };
    },
    [ActionTypes.POST_UNDELETE]: (message: string) => {
        const match = /^Undeleted post #(?<post>\d+)$/.exec(message);

        return match === null ? null : {
            post: {
                id: Number(match.groups!.post)
            }
        };
    },
    [ActionTypes.POST_DESTROY]: (message: string) => {
        const match = /^Destroyed post #(?<post>\d+)$/.exec(message);

        return match === null ? null : {
            post: {
                id: Number(match.groups!.post)
            }
        };
    },
    [ActionTypes.POST_RATING_LOCK]: (message: string) => {
        const match = /^Post rating was (?<action>locked|unlocked) on post #(?<post>\d+)$/.exec(message);

        return match === null ? null : {
            post: {
                id:     Number(match.groups!.post),
                action: match.groups!.action
            }
        };
    },
    [ActionTypes.POST_UNAPPROVE]: (message: string) => {
        const match = /^Unapproved post #(?<post>\d+)$/.exec(message);

        return match === null ? null : {
            post: {
                id: Number(match.groups!.post)
            }
        };
    },
    [ActionTypes.POST_REPLACEMENT_ACCEPT]: (message: string) => {
        const match = /^Post replacement for post #(?<post>\d+) was accepted$/.exec(message);

        return match === null ? null : {
            post: {
                id: Number(match.groups!.post)
            }
        };
    },
    [ActionTypes.POST_REPLACEMENT_REJECT]: (message: string) => {
        const match = /^Post replacement for post #(?<post>\d+) was rejected$/.exec(message);

        return match === null ? null : {
            post: {
                id: Number(match.groups!.post)
            }
        };
    },
    [ActionTypes.POST_REPLACEMENT_DELETE]: (message: string) => {
        const match = /^Post replacement for post #(?<post>\d+) was deleted$/.exec(message);

        return match === null ? null : {
            post: {
                id: Number(match.groups!.post)
            }
        };
    }
} satisfies Record<ActionTypes, ((message: string, messageElement: HTMLTableCellElement) => object | null)>;
