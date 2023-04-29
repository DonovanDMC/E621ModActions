/* eslint-disable unicorn/no-useless-undefined */
import testData from "./data.json" assert { type: "json" };
import { ActionTypes } from "../lib/Constants.js";
import type { AnyAction, ActionMap } from "../lib/types.js";
import E621ModActions from "../lib/index.js";
import { expect } from "chai";
import assert from "node:assert";
const expectedDate = new Date(/datetime=&quot;(\d{4}(?:-\d{2}){2}T\d{2}:\d{2}-\d{4})/.exec(testData._time)![1]);

function standard<T extends ActionTypes = ActionTypes>(type: T, data: AnyAction): asserts data is ActionMap[T] {
    expect(data.type).to.eq(type);
    expect(data.date).to.eql(expectedDate);
    expect(data.blame.id).to.eq(1);
    expect(data.blame.name).to.eq("Admin");
}

const client = new E621ModActions({
    _fetch(input) {
        assert(typeof input === "string");
        const type = /search\[action]=(\w+)/.exec(decodeURIComponent(input))![1] as ActionTypes;
        const data = testData[type] === null ? [] : (Array.isArray(testData[type]) ? testData[type] as Array<string> : [testData[type] as string]);
        return Promise.resolve(new Response(`<html><head><title> Mod Actions\n - e621</title></head><body><div id="c-mod-actions"><table><tbody>${data.map(d => `<tr>${testData._time}${testData._user}${d}</tr>`.replace(/&quot;/g, "\"")).join("")}</tbody></table></div></body></html>`, {
            status:  200,
            headers: {
                "Content-Type": "text/html"
            }
        }));
    }
});
describe("Parsing", function () {
    it(ActionTypes.ARTIST_PAGE_RENAME, async function () {
        const [data = null] = await client.search({ action: ActionTypes.ARTIST_PAGE_RENAME });
        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.ARTIST_PAGE_RENAME, data);
        expect(data.oldName).to.eq("test");
        expect(data.newName).to.eq("test2");
    });

    it(ActionTypes.ARTIST_PAGE_LOCK, async function () {
        const [data = null] = await client.search({ action: ActionTypes.ARTIST_PAGE_LOCK });
        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.ARTIST_PAGE_LOCK, data);
        expect(data.artist.id).to.eq(1);
    });

    it(ActionTypes.ARTIST_PAGE_UNLOCK, async function () {
        const [data = null] = await client.search({ action: ActionTypes.ARTIST_PAGE_UNLOCK });
        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.ARTIST_PAGE_UNLOCK, data);
        expect(data.artist.id).to.eq(1);
    });

    it(ActionTypes.ARTIST_USER_LINKED, async function () {
        const [data = null] = await client.search({ action: ActionTypes.ARTIST_USER_LINKED });
        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.ARTIST_USER_LINKED, data);
        expect(data.artist.id).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.ARTIST_USER_UNLINKED, async function () {
        const [noUser = null, data = null] = await client.search({ action: ActionTypes.ARTIST_USER_UNLINKED });
        if (noUser === null || data === null) {
            return this.skip();
        }

        standard(ActionTypes.ARTIST_USER_UNLINKED, noUser);
        expect(noUser.artist.id).to.eq(1);
        expect(noUser.user).to.eq(null);

        standard(ActionTypes.ARTIST_USER_UNLINKED, data);
        expect(data.artist.id).to.eq(1);
        expect(data.user?.id).to.eq(2);
        expect(data.user?.name).to.eq("test");
    });

    it(ActionTypes.BLIP_DELETE, async function () {
        const [noUser = null, data = null] = await client.search({ action: ActionTypes.BLIP_DELETE });
        if (noUser === null || data === null) {
            return this.skip();
        }

        standard(ActionTypes.BLIP_DELETE, noUser);
        expect(noUser.blip.id).to.eq(1);
        expect(noUser.user).to.eq(null);
        standard(ActionTypes.BLIP_DELETE, data);
        expect(data.blip.id).to.eq(1);
        expect(data.user?.id).to.eq(null);
        expect(data.user?.name).to.eq("test");
    });

    it(ActionTypes.BLIP_HIDE, async function () {
        const [noUser = null, data = null] = await client.search({ action: ActionTypes.BLIP_HIDE });
        if (noUser === null || data === null) {
            return this.skip();
        }

        standard(ActionTypes.BLIP_HIDE, noUser);
        expect(noUser.blip.id).to.eq(1);
        expect(noUser.user).to.eq(null);
        standard(ActionTypes.BLIP_HIDE, data);
        expect(data.blip.id).to.eq(1);
        expect(data.user?.id).to.eq(null);
        expect(data.user?.name).to.eq("test");
    });

    it(ActionTypes.BLIP_UNHIDE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.BLIP_UNHIDE });
        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.BLIP_UNHIDE, data);
        expect(data.blip.id).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.BLIP_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.BLIP_UPDATE });
        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.BLIP_UPDATE, data);
        expect(data.blip.id).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.COMMENT_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.COMMENT_DELETE });
        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.COMMENT_DELETE, data);
        expect(data.comment.id).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.COMMENT_HIDE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.COMMENT_HIDE });
        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.COMMENT_HIDE, data);
        expect(data.comment.id).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.COMMENT_UNHIDE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.COMMENT_UNHIDE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.COMMENT_UNHIDE, data);
        expect(data.comment.id).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.COMMENT_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.COMMENT_UPDATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.COMMENT_UPDATE, data);
        expect(data.comment.id).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_CATEGORY_CREATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.FORUM_CATEGORY_CREATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_CATEGORY_CREATE, data);
        expect(data.forumCategory.id).to.eq(1);
    });

    it(ActionTypes.FORUM_CATEGORY_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.FORUM_CATEGORY_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_CATEGORY_DELETE, data);
        expect(data.forumCategory.id).to.eq(1);
    });

    it(ActionTypes.FORUM_CATEGORY_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.FORUM_CATEGORY_UPDATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_CATEGORY_UPDATE, data);
        expect(data.forumCategory.id).to.eq(1);
    });

    it(ActionTypes.FORUM_POST_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.FORUM_POST_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_POST_DELETE, data);
        expect(data.forumPost.id).to.eq(1);
        expect(data.forumPost.topic).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_POST_HIDE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.FORUM_POST_HIDE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_POST_HIDE, data);
        expect(data.forumPost.id).to.eq(1);
        expect(data.forumPost.topic).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_POST_UNHIDE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.FORUM_POST_UNHIDE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_POST_UNHIDE, data);
        expect(data.forumPost.id).to.eq(1);
        expect(data.forumPost.topic).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_POST_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.FORUM_POST_UPDATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_POST_UPDATE, data);
        expect(data.forumPost.id).to.eq(1);
        expect(data.forumPost.topic).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_TOPIC_DELETE, async function () {
        const [data = null, twoWords = null] = await client.search({ action: ActionTypes.FORUM_TOPIC_DELETE });

        if (data === null || twoWords === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_TOPIC_DELETE, data);
        expect(data.forumTopic.id).to.eq(1);
        expect(data.forumTopic.title).to.eq("Test");
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");

        standard(ActionTypes.FORUM_TOPIC_DELETE, twoWords);
        expect(twoWords.forumTopic.id).to.eq(1);
        expect(twoWords.forumTopic.title).to.eq("Two Words");
        expect(twoWords.user.id).to.eq(2);
        expect(twoWords.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_TOPIC_HIDE, async function () {
        const [data = null, twoWords = null] = await client.search({ action: ActionTypes.FORUM_TOPIC_HIDE });

        if (data === null || twoWords === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_TOPIC_HIDE, data);
        expect(data.forumTopic.id).to.eq(1);
        expect(data.forumTopic.title).to.eq("Test");
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");

        standard(ActionTypes.FORUM_TOPIC_HIDE, twoWords);
        expect(twoWords.forumTopic.id).to.eq(1);
        expect(twoWords.forumTopic.title).to.eq("Two Words");
        expect(twoWords.user.id).to.eq(2);
        expect(twoWords.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_TOPIC_UNHIDE, async function () {
        const [data = null, twoWords = null] = await client.search({ action: ActionTypes.FORUM_TOPIC_UNHIDE });

        if (data === null || twoWords === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_TOPIC_UNHIDE, data);
        expect(data.forumTopic.id).to.eq(1);
        expect(data.forumTopic.title).to.eq("Test");
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");

        standard(ActionTypes.FORUM_TOPIC_UNHIDE, twoWords);
        expect(twoWords.forumTopic.id).to.eq(1);
        expect(twoWords.forumTopic.title).to.eq("Two Words");
        expect(twoWords.user.id).to.eq(2);
        expect(twoWords.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_TOPIC_LOCK, async function () {
        const [data = null, twoWords = null] = await client.search({ action: ActionTypes.FORUM_TOPIC_LOCK });

        if (data === null || twoWords === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_TOPIC_LOCK, data);
        expect(data.forumTopic.id).to.eq(1);
        expect(data.forumTopic.title).to.eq("Test");
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");

        standard(ActionTypes.FORUM_TOPIC_LOCK, twoWords);
        expect(twoWords.forumTopic.id).to.eq(1);
        expect(twoWords.forumTopic.title).to.eq("Two Words");
        expect(twoWords.user.id).to.eq(2);
        expect(twoWords.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_TOPIC_UNLOCK, async function () {
        const [data = null, twoWords = null] = await client.search({ action: ActionTypes.FORUM_TOPIC_UNLOCK });

        if (data === null || twoWords === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_TOPIC_UNLOCK, data);
        expect(data.forumTopic.id).to.eq(1);
        expect(data.forumTopic.title).to.eq("Test");
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");

        standard(ActionTypes.FORUM_TOPIC_UNLOCK, twoWords);
        expect(twoWords.forumTopic.id).to.eq(1);
        expect(twoWords.forumTopic.title).to.eq("Two Words");
        expect(twoWords.user.id).to.eq(2);
        expect(twoWords.user.name).to.eq("test");
    });

    it(ActionTypes.FORUM_TOPIC_UNSTICK, async function () {
        const [data = null, twoWords = null] = await client.search({ action: ActionTypes.FORUM_TOPIC_UNSTICK });

        if (data === null || twoWords === null) {
            return this.skip();
        }

        standard(ActionTypes.FORUM_TOPIC_UNSTICK, data);
        expect(data.forumTopic.id).to.eq(1);
        expect(data.forumTopic.title).to.eq("Test");
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");

        standard(ActionTypes.FORUM_TOPIC_UNSTICK, twoWords);
        expect(twoWords.forumTopic.id).to.eq(1);
        expect(twoWords.forumTopic.title).to.eq("Two Words");
        expect(twoWords.user.id).to.eq(2);
        expect(twoWords.user.name).to.eq("test");
    });

    // @TODO
    it(ActionTypes.FORUM_TOPIC_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.FORUM_TOPIC_UPDATE });

        if (data === null) {
            return this.skip();
        }

        throw new Error(`Test Not Implemented (${ActionTypes.FORUM_TOPIC_UPDATE})`);
    });

    it(ActionTypes.HELP_CREATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.HELP_CREATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.HELP_CREATE, data);
        expect(data.help.name).to.eq("test");
        expect(data.help.wikiPage).to.eq("help:test");
    });

    it(ActionTypes.HELP_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.HELP_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.HELP_DELETE, data);
        expect(data.help.name).to.eq("test");
        expect(data.help.wikiPage).to.eq("help:test");
    });

    it(ActionTypes.HELP_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.HELP_UPDATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.HELP_UPDATE, data);
        expect(data.help.name).to.eq("test");
        expect(data.help.wikiPage).to.eq("help:test");
    });

    it(ActionTypes.IP_BAN_CREATE, async function () {
        const [data = null, withIP = null] = await client.search({ action: ActionTypes.IP_BAN_CREATE });

        if (data === null || withIP === null) {
            return this.skip();
        }

        standard(ActionTypes.IP_BAN_CREATE, data);
        expect(data.ipAddress).to.eq(null);
        expect(data.reason).to.eq(null);
        standard(ActionTypes.IP_BAN_CREATE, withIP);
        expect(withIP.ipAddress).to.eq("127.0.0.1");
        expect(withIP.reason).to.eq("test");
    });

    it(ActionTypes.IP_BAN_DELETE, async function () {
        const [data = null, withIP = null] = await client.search({ action: ActionTypes.IP_BAN_DELETE });

        if (data === null || withIP === null) {
            return this.skip();
        }

        standard(ActionTypes.IP_BAN_DELETE, data);
        expect(data.ipAddress).to.eq(null);
        expect(data.reason).to.eq(null);
        standard(ActionTypes.IP_BAN_DELETE, withIP);
        expect(withIP.ipAddress).to.eq("127.0.0.1");
        expect(withIP.reason).to.eq("test");
    });

    it(ActionTypes.MASCOT_CREATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.MASCOT_CREATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.MASCOT_CREATE, data);
        expect(data.mascot.id).to.eq(1);
    });

    it(ActionTypes.MASCOT_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.MASCOT_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.MASCOT_DELETE, data);
        expect(data.mascot.id).to.eq(1);
    });

    it(ActionTypes.MASCOT_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.MASCOT_UPDATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.MASCOT_UPDATE, data);
        expect(data.mascot.id).to.eq(1);
    });

    it(ActionTypes.POOL_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.POOL_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.POOL_DELETE, data);
        expect(data.pool.id).to.eq(1);
        expect(data.pool.name).to.eq("Test");
    });

    it(ActionTypes.REPORT_REASON_CREATE, async function () {
        const [data = null, twoWords = null] = await client.search({ action: ActionTypes.REPORT_REASON_CREATE });

        if (data === null || twoWords === null) {
            return this.skip();
        }

        standard(ActionTypes.REPORT_REASON_CREATE, data);
        expect(data.reportReason.reason).to.eq("Test");

        standard(ActionTypes.REPORT_REASON_CREATE, twoWords);
        expect(twoWords.reportReason.reason).to.eq("Two Words");
    });

    it(ActionTypes.REPORT_REASON_DELETE, async function () {
        const [data = null, twoWords = null] = await client.search({ action: ActionTypes.REPORT_REASON_DELETE });

        if (data === null || twoWords === null) {
            return this.skip();
        }

        standard(ActionTypes.REPORT_REASON_DELETE, data);
        expect(data.reportReason.reason).to.eq("Test");

        standard(ActionTypes.REPORT_REASON_DELETE, twoWords);
        expect(twoWords.reportReason.reason).to.eq("Two Words");
    });

    it(ActionTypes.REPORT_REASON_UPDATE, async function () {
        const [single = null, oneToTwo = null, twoToOne = null] = await client.search({ action: ActionTypes.REPORT_REASON_UPDATE });

        if (single === null || oneToTwo === null || twoToOne === null) {
            return this.skip();
        }

        standard(ActionTypes.REPORT_REASON_UPDATE, single);
        expect(single.reportReason.oldReason).to.eq("Test");
        expect(single.reportReason.newReason).to.eq("Test");

        standard(ActionTypes.REPORT_REASON_UPDATE, oneToTwo);
        expect(oneToTwo.reportReason.oldReason).to.eq("Test");
        expect(oneToTwo.reportReason.newReason).to.eq("Two Words");

        standard(ActionTypes.REPORT_REASON_UPDATE, twoToOne);
        expect(twoToOne.reportReason.oldReason).to.eq("Two Words");
        expect(twoToOne.reportReason.newReason).to.eq("Test");
    });

    it(ActionTypes.SET_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.SET_UPDATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.SET_UPDATE, data);
        expect(data.set.id).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.SET_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.SET_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.SET_DELETE, data);
        expect(data.set.id).to.eq(1);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.SET_CHANGE_VISIBILITY, async function () {
        const [publicData = null, privateData = null] = await client.search({ action: ActionTypes.SET_CHANGE_VISIBILITY });

        if (publicData === null || privateData === null) {
            return this.skip();
        }

        standard(ActionTypes.SET_CHANGE_VISIBILITY, publicData);
        expect(publicData.set.id).to.eq(1);
        expect(publicData.user.id).to.eq(2);
        expect(publicData.user.name).to.eq("test");
        expect(publicData.visibility).to.eq("public");

        standard(ActionTypes.SET_CHANGE_VISIBILITY, privateData);
        expect(privateData.set.id).to.eq(1);
        expect(privateData.user.id).to.eq(2);
        expect(privateData.user.name).to.eq("test");
        expect(privateData.visibility).to.eq("private");
    });

    it(ActionTypes.TAG_ALIAS_CREATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TAG_ALIAS_CREATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.TAG_ALIAS_CREATE, data);
        expect(data.tagAlias.id).to.eq(1);
        expect(data.tagAlias.antecedent).to.eq("test");
        expect(data.tagAlias.consequent).to.eq("test2");
    });

    it(ActionTypes.TAG_ALIAS_APPROVE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TAG_ALIAS_APPROVE });

        if (data === null) {
            return this.skip();
        }

        throw new Error(`Test Not implemented: ${ActionTypes.TAG_ALIAS_APPROVE}`);
    });

    it(ActionTypes.TAG_ALIAS_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TAG_ALIAS_DELETE });

        if (data === null) {
            return this.skip();
        }

        throw new Error(`Test Not implemented: ${ActionTypes.TAG_ALIAS_DELETE}`);
    });

    it(ActionTypes.TAG_ALIAS_UPDATE, async function () {
        const [status = null, approver_id = null, post_count = null, antecedent_name = null, consequent_name = null, combined = null] = await client.search({ action: ActionTypes.TAG_ALIAS_UPDATE });

        if (status === null || approver_id === null || post_count === null || antecedent_name === null || consequent_name === null || combined === null) {
            return this.skip();
        }

        standard(ActionTypes.TAG_ALIAS_UPDATE, status);
        expect(status.tagAlias.id).to.eq(1);
        expect(status.tagAlias.antecedent).to.eq("test");
        expect(status.tagAlias.consequent).to.eq("test2");
        expect(status.tagAlias.updates.status?.old).to.eq("processing");
        expect(status.tagAlias.updates.status?.new).to.eq("active");

        standard(ActionTypes.TAG_ALIAS_UPDATE, approver_id);
        expect(approver_id.tagAlias.id).to.eq(1);
        expect(approver_id.tagAlias.antecedent).to.eq("test");
        expect(approver_id.tagAlias.consequent).to.eq("test2");
        expect(approver_id.tagAlias.updates.approverID).to.eq(1);

        standard(ActionTypes.TAG_ALIAS_UPDATE, post_count);
        expect(post_count.tagAlias.id).to.eq(1);
        expect(post_count.tagAlias.antecedent).to.eq("test");
        expect(post_count.tagAlias.consequent).to.eq("test2");
        expect(post_count.tagAlias.updates.postCount?.old).to.eq(1);
        expect(post_count.tagAlias.updates.postCount?.new).to.eq(0);

        standard(ActionTypes.TAG_ALIAS_UPDATE, antecedent_name);
        expect(antecedent_name.tagAlias.id).to.eq(1);
        expect(antecedent_name.tagAlias.antecedent).to.eq("test");
        expect(antecedent_name.tagAlias.consequent).to.eq("test2");
        expect(antecedent_name.tagAlias.updates.antecedentName?.old).to.eq("test");
        expect(antecedent_name.tagAlias.updates.antecedentName?.new).to.eq("test2");

        standard(ActionTypes.TAG_ALIAS_UPDATE, consequent_name);
        expect(consequent_name.tagAlias.id).to.eq(1);
        expect(consequent_name.tagAlias.antecedent).to.eq("test");
        expect(consequent_name.tagAlias.consequent).to.eq("test2");
        expect(consequent_name.tagAlias.updates.consequentName?.old).to.eq("test2");
        expect(consequent_name.tagAlias.updates.consequentName?.new).to.eq("test");

        standard(ActionTypes.TAG_ALIAS_UPDATE, combined);
        expect(combined.tagAlias.id).to.eq(1);
        expect(combined.tagAlias.antecedent).to.eq("test");
        expect(combined.tagAlias.consequent).to.eq("test2");
        expect(combined.tagAlias.updates.status?.old).to.eq("processing");
        expect(combined.tagAlias.updates.status?.new).to.eq("active");
        expect(combined.tagAlias.updates.approverID).to.eq(1);
        expect(combined.tagAlias.updates.postCount?.old).to.eq(1);
        expect(combined.tagAlias.updates.postCount?.new).to.eq(0);
        expect(combined.tagAlias.updates.antecedentName?.old).to.eq("test");
        expect(combined.tagAlias.updates.antecedentName?.new).to.eq("test2");
        expect(combined.tagAlias.updates.consequentName?.old).to.eq("test2");
        expect(combined.tagAlias.updates.consequentName?.new).to.eq("test");
    });

    it(ActionTypes.TAG_IMPLICATION_CREATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TAG_IMPLICATION_CREATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.TAG_IMPLICATION_CREATE, data);
        expect(data.tagImplication.id).to.eq(1);
        expect(data.tagImplication.antecedent).to.eq("test");
        expect(data.tagImplication.consequent).to.eq("test2");
    });

    it(ActionTypes.TAG_IMPLICATION_APPROVE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TAG_IMPLICATION_APPROVE });

        if (data === null) {
            return this.skip();
        }

        throw new Error(`Test Not implemented: ${ActionTypes.TAG_IMPLICATION_APPROVE}`);
    });

    it(ActionTypes.TAG_IMPLICATION_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TAG_IMPLICATION_DELETE });

        if (data === null) {
            return this.skip();
        }

        throw new Error(`Test Not implemented: ${ActionTypes.TAG_IMPLICATION_DELETE}`);
    });

    it(ActionTypes.TAG_IMPLICATION_UPDATE, async function () {
        const [status = null, approver_id = null, antecedent_name = null, consequent_name = null, combined = null] = await client.search({ action: ActionTypes.TAG_IMPLICATION_UPDATE });

        if (status === null || approver_id === null || antecedent_name === null || consequent_name === null || combined === null) {
            return this.skip();
        }

        standard(ActionTypes.TAG_IMPLICATION_UPDATE, status);
        expect(status.tagImplication.id).to.eq(1);
        expect(status.tagImplication.antecedent).to.eq("test");
        expect(status.tagImplication.consequent).to.eq("test2");
        expect(status.tagImplication.updates.status?.old).to.eq("processing");
        expect(status.tagImplication.updates.status?.new).to.eq("active");

        standard(ActionTypes.TAG_IMPLICATION_UPDATE, approver_id);
        expect(approver_id.tagImplication.id).to.eq(1);
        expect(approver_id.tagImplication.antecedent).to.eq("test");
        expect(approver_id.tagImplication.consequent).to.eq("test2");
        expect(approver_id.tagImplication.updates.approverID).to.eq(1);

        standard(ActionTypes.TAG_IMPLICATION_UPDATE, antecedent_name);
        expect(antecedent_name.tagImplication.id).to.eq(1);
        expect(antecedent_name.tagImplication.antecedent).to.eq("test");
        expect(antecedent_name.tagImplication.consequent).to.eq("test2");
        expect(antecedent_name.tagImplication.updates.antecedentName?.old).to.eq("test");
        expect(antecedent_name.tagImplication.updates.antecedentName?.new).to.eq("test2");

        standard(ActionTypes.TAG_IMPLICATION_UPDATE, consequent_name);
        expect(consequent_name.tagImplication.id).to.eq(1);
        expect(consequent_name.tagImplication.antecedent).to.eq("test");
        expect(consequent_name.tagImplication.consequent).to.eq("test2");
        expect(consequent_name.tagImplication.updates.consequentName?.old).to.eq("test2");
        expect(consequent_name.tagImplication.updates.consequentName?.new).to.eq("test");

        standard(ActionTypes.TAG_IMPLICATION_UPDATE, combined);
        expect(combined.tagImplication.id).to.eq(1);
        expect(combined.tagImplication.antecedent).to.eq("test");
        expect(combined.tagImplication.consequent).to.eq("test2");
        expect(combined.tagImplication.updates.status?.old).to.eq("processing");
        expect(combined.tagImplication.updates.status?.new).to.eq("active");
        expect(combined.tagImplication.updates.approverID).to.eq(1);
        expect(combined.tagImplication.updates.antecedentName?.old).to.eq("test");
        expect(combined.tagImplication.updates.antecedentName?.new).to.eq("test2");
        expect(combined.tagImplication.updates.consequentName?.old).to.eq("test2");
        expect(combined.tagImplication.updates.consequentName?.new).to.eq("test");
    });

    it(ActionTypes.TICKET_CLAIM, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TICKET_CLAIM });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.TICKET_CLAIM, data);
        expect(data.ticket.id).to.eq(1);
    });

    it(ActionTypes.TICKET_UNCLAIM, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TICKET_UNCLAIM });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.TICKET_UNCLAIM, data);
        expect(data.ticket.id).to.eq(1);
    });

    it(ActionTypes.TICKET_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TICKET_UPDATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.TICKET_UPDATE, data);
        expect(data.ticket.id).to.eq(1);
    });

    it(ActionTypes.UPLOAD_WHITELIST_CREATE, async function () {
        const [data = null, hidden = null] = await client.search({ action: ActionTypes.UPLOAD_WHITELIST_CREATE });

        if (data === null || hidden === null) {
            return this.skip();
        }

        standard(ActionTypes.UPLOAD_WHITELIST_CREATE, data);
        expect(data.whitelist.entry).to.eq("test");

        standard(ActionTypes.UPLOAD_WHITELIST_CREATE, hidden);
        expect(hidden.whitelist.entry).to.eq(undefined);
    });

    it(ActionTypes.UPLOAD_WHITELIST_UPDATE, async function () {
        const [data = null, pattern = null, hidden = null] = await client.search({ action: ActionTypes.UPLOAD_WHITELIST_UPDATE });

        if (data === null || pattern === null || hidden === null) {
            return this.skip();
        }

        standard(ActionTypes.UPLOAD_WHITELIST_UPDATE, data);
        expect(data.whitelist.entry).to.eq("test");
        expect(data.whitelist.oldPattern).to.eq(undefined);
        expect(data.whitelist.newPattern).to.eq(undefined);

        standard(ActionTypes.UPLOAD_WHITELIST_UPDATE, pattern);
        expect(pattern.whitelist.entry).to.eq(undefined);
        expect(pattern.whitelist.oldPattern).to.eq("pattern");
        expect(pattern.whitelist.newPattern).to.eq("pattern2");

        standard(ActionTypes.UPLOAD_WHITELIST_UPDATE, hidden);
        expect(hidden.whitelist.entry).to.eq(undefined);
        expect(hidden.whitelist.oldPattern).to.eq(undefined);
        expect(hidden.whitelist.newPattern).to.eq(undefined);
    });

    it(ActionTypes.UPLOAD_WHITELIST_DELETE, async function () {
        const [data = null, hidden = null] = await client.search({ action: ActionTypes.UPLOAD_WHITELIST_DELETE });

        if (data === null || hidden === null) {
            return this.skip();
        }

        standard(ActionTypes.UPLOAD_WHITELIST_DELETE, data);
        expect(data.whitelist.entry).to.eq("test");

        standard(ActionTypes.UPLOAD_WHITELIST_DELETE, hidden);
        expect(hidden.whitelist.entry).to.eq(undefined);
    });

    it(ActionTypes.USER_BLACKLIST_CHANGED, async function () {
        const [data = null] = await client.search({ action: ActionTypes.USER_BLACKLIST_CHANGED });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_BLACKLIST_CHANGED, data);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.USER_TEXT_CHANGE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.USER_TEXT_CHANGE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_TEXT_CHANGE, data);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.CHANGED_USER_TEXT, async function () {
        const [data = null] = await client.search({ action: ActionTypes.CHANGED_USER_TEXT }, true);

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.CHANGED_USER_TEXT, data);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.USER_UPLOAD_LIMIT_CHANGE, async function () {
        const [data = null, negPos = null, posNeg = null] = await client.search({ action: ActionTypes.USER_UPLOAD_LIMIT_CHANGE });

        if (data === null || negPos === null || posNeg === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_UPLOAD_LIMIT_CHANGE, data);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
        expect(data.oldLimit).to.eq(1);
        expect(data.newLimit).to.eq(0);

        standard(ActionTypes.USER_UPLOAD_LIMIT_CHANGE, negPos);
        expect(negPos.user.id).to.eq(2);
        expect(negPos.user.name).to.eq("test");
        expect(negPos.oldLimit).to.eq(-1);
        expect(negPos.newLimit).to.eq(1);

        standard(ActionTypes.USER_UPLOAD_LIMIT_CHANGE, posNeg);
        expect(posNeg.user.id).to.eq(2);
        expect(posNeg.user.name).to.eq("test");
        expect(posNeg.oldLimit).to.eq(1);
        expect(posNeg.newLimit).to.eq(-1);
    });

    it(ActionTypes.USER_FLAGS_CHANGE, async function () {
        const [remove_only = null, add_only = null, both = null, both2 = null] = await client.search({ action: ActionTypes.USER_FLAGS_CHANGE });

        if (remove_only === null || add_only === null || both === null || both2 === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_FLAGS_CHANGE, remove_only);
        expect(remove_only.user.id).to.eq(2);
        expect(remove_only.user.name).to.eq("test");
        expect(remove_only.addedFlags).to.eql([]);
        expect(remove_only.removedFlags).to.eql(["unlimited upload slots"]);

        standard(ActionTypes.USER_FLAGS_CHANGE, add_only);
        expect(add_only.user.id).to.eq(2);
        expect(add_only.user.name).to.eq("test");
        expect(add_only.addedFlags).to.eql(["replacements beta"]);
        expect(add_only.removedFlags).to.eql([]);

        standard(ActionTypes.USER_FLAGS_CHANGE, both);
        expect(both.user.id).to.eq(2);
        expect(both.user.name).to.eq("test");
        expect(both.addedFlags).to.eql(["approve posts", "replacements beta"]);
        expect(both.removedFlags).to.eql(["unlimited upload slots"]);

        standard(ActionTypes.USER_FLAGS_CHANGE, both2);
        expect(both2.user.id).to.eq(2);
        expect(both2.user.name).to.eq("test");
        expect(both2.addedFlags).to.eql(["unlimited upload slots"]);
        expect(both2.removedFlags).to.eql(["approve posts", "replacements beta"]);
    });

    it(ActionTypes.USER_LEVEL_CHANGE, async function () {
        const [memberToAdmin = null, adminToFormerStaff = null] = await client.search({ action: ActionTypes.USER_LEVEL_CHANGE });

        if (memberToAdmin === null || adminToFormerStaff === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_LEVEL_CHANGE, memberToAdmin);
        expect(memberToAdmin.user.id).to.eq(2);
        expect(memberToAdmin.user.name).to.eq("test");
        expect(memberToAdmin.oldLevel).to.eq("Member");
        expect(memberToAdmin.newLevel).to.eq("Admin");

        standard(ActionTypes.USER_LEVEL_CHANGE, adminToFormerStaff);
        expect(adminToFormerStaff.user.id).to.eq(2);
        expect(adminToFormerStaff.user.name).to.eq("test");
        expect(adminToFormerStaff.oldLevel).to.eq("Admin");
        expect(adminToFormerStaff.newLevel).to.eq("Former Staff");
    });

    it(ActionTypes.USER_NAME_CHANGE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.USER_NAME_CHANGE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_NAME_CHANGE, data);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test2");
        expect(data.oldName).to.eq("test");
        expect(data.newName).to.eq("test2");
    });

    it(ActionTypes.USER_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.USER_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_DELETE, data);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.USER_BAN, async function () {
        const [permanent = null, days = null, none = null] = await client.search({ action: ActionTypes.USER_BAN });

        if (permanent === null || days === null || none === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_BAN, permanent);
        expect(permanent.user.id).to.eq(2);
        expect(permanent.user.name).to.eq("test");
        expect(permanent.duration).to.eq(null);

        standard(ActionTypes.USER_BAN, days);
        expect(days.user.id).to.eq(2);
        expect(days.user.name).to.eq("test");
        expect(days.duration).to.eq(5);

        standard(ActionTypes.USER_BAN, none);
        expect(none.user.id).to.eq(2);
        expect(none.user.name).to.eq("test");
        expect(none.duration).to.eq(undefined);
    });

    it(ActionTypes.USER_UNBAN, async function () {
        const [data = null] = await client.search({ action: ActionTypes.USER_UNBAN });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_UNBAN, data);
        expect(data.user.id).to.eq(2);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.USER_FEEDBACK_CREATE, async function () {
        const [simple = null, complicated = null] = await client.search({ action: ActionTypes.USER_FEEDBACK_CREATE });

        if (simple === null || complicated === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_FEEDBACK_CREATE, simple);
        expect(simple.user.id).to.eq(2);
        expect(simple.user.name).to.eq("test");
        expect(simple.record.id).to.eq(1);
        expect(simple.record.type).to.eq("negative");
        expect(simple.record.textReason).to.eq("Testing Reason");
        expect(simple.record.htmlReason).to.eq("Testing Reason");

        standard(ActionTypes.USER_FEEDBACK_CREATE, complicated);
        expect(complicated.user.id).to.eq(2);
        expect(complicated.user.name).to.eq("test");
        expect(complicated.record.id).to.eq(1);
        expect(complicated.record.type).to.eq("neutral");
        expect(complicated.record.textReason).to.eq("Don't open this: post #1You're Gaypost #1");
        expect(complicated.record.htmlReason).to.eq("Don't open this: <a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></p><div class=\"expandable\"><div class=\"expandable-header\"><span class=\"section-arrow\"></span><span>You're Gay</span></div><div class=\"expandable-content\" style=\"display: none;\"><p><a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></div></div>");
    });

    it(ActionTypes.USER_FEEDBACK_UPDATE, async function () {
        const [simple = null, complicated = null] = await client.search({ action: ActionTypes.USER_FEEDBACK_UPDATE });

        if (simple === null || complicated === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_FEEDBACK_UPDATE, simple);
        expect(simple.user.id).to.eq(2);
        expect(simple.user.name).to.eq("test");
        expect(simple.record.id).to.eq(1);
        expect(simple.record.type).to.eq("negative");
        expect(simple.record.textReason).to.eq("Testing Reason");
        expect(simple.record.htmlReason).to.eq("Testing Reason");

        standard(ActionTypes.USER_FEEDBACK_UPDATE, complicated);
        expect(complicated.user.id).to.eq(2);
        expect(complicated.user.name).to.eq("test");
        expect(complicated.record.id).to.eq(1);
        expect(complicated.record.type).to.eq("neutral");
        expect(complicated.record.textReason).to.eq("Don't open this: post #1You're Gaypost #1");
        expect(complicated.record.htmlReason).to.eq("Don't open this: <a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></p><div class=\"expandable\"><div class=\"expandable-header\"><span class=\"section-arrow\"></span><span>You're Gay</span></div><div class=\"expandable-content\" style=\"display: none;\"><p><a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></div></div>");
    });

    it(ActionTypes.USER_FEEDBACK_DELETE, async function () {
        const [simple = null, complicated = null] = await client.search({ action: ActionTypes.USER_FEEDBACK_DELETE });

        if (simple === null || complicated === null) {
            return this.skip();
        }

        standard(ActionTypes.USER_FEEDBACK_DELETE, simple);
        expect(simple.user.id).to.eq(2);
        expect(simple.user.name).to.eq("test");
        expect(simple.record.id).to.eq(1);
        expect(simple.record.type).to.eq("negative");
        expect(simple.record.textReason).to.eq("Testing Reason");
        expect(simple.record.htmlReason).to.eq("Testing Reason");

        standard(ActionTypes.USER_FEEDBACK_DELETE, complicated);
        expect(complicated.user.id).to.eq(2);
        expect(complicated.user.name).to.eq("test");
        expect(complicated.record.id).to.eq(1);
        expect(complicated.record.type).to.eq("neutral");
        expect(complicated.record.textReason).to.eq("Don't open this: post #1You're Gaypost #1");
        expect(complicated.record.htmlReason).to.eq("Don't open this: <a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></p><div class=\"expandable\"><div class=\"expandable-header\"><span class=\"section-arrow\"></span><span>You're Gay</span></div><div class=\"expandable-content\" style=\"display: none;\"><p><a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></div></div>");
    });

    it(ActionTypes.WIKI_PAGE_RENAME, async function () {
        const [data = null] = await client.search({ action: ActionTypes.WIKI_PAGE_RENAME });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.WIKI_PAGE_RENAME, data);
        expect(data.wikiPage.oldName).to.eq("test");
        expect(data.wikiPage.newName).to.eq("test2");
    });

    it(ActionTypes.WIKI_PAGE_LOCK, async function () {
        const [data = null] = await client.search({ action: ActionTypes.WIKI_PAGE_LOCK });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.WIKI_PAGE_LOCK, data);
        expect(data.wikiPage.name).to.eq("test");
    });

    it(ActionTypes.WIKI_PAGE_UNLOCK, async function () {
        const [data = null] = await client.search({ action: ActionTypes.WIKI_PAGE_UNLOCK });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.WIKI_PAGE_UNLOCK, data);
        expect(data.wikiPage.name).to.eq("test");
    });

    it(ActionTypes.WIKI_PAGE_UNLOCK, async function () {
        const [data = null] = await client.search({ action: ActionTypes.WIKI_PAGE_UNLOCK });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.WIKI_PAGE_UNLOCK, data);
        expect(data.wikiPage.name).to.eq("test");
    });

    it(ActionTypes.WIKI_PAGE_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.WIKI_PAGE_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.WIKI_PAGE_DELETE, data);
        expect(data.wikiPage.name).to.eq("test");
    });

    it(ActionTypes.MASS_UPDATE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.MASS_UPDATE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.MASS_UPDATE, data);
        expect(data.oldTag).to.eq("test");
        expect(data.newTag).to.eq("test2");
    });

    it(ActionTypes.NUKE_TAG, async function () {
        const [data = null] = await client.search({ action: ActionTypes.NUKE_TAG });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.NUKE_TAG, data);
        expect(data.tag).to.eq("test");
    });

    it(ActionTypes.TAKEDOWN_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TAKEDOWN_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.TAKEDOWN_DELETE, data);
        expect(data.takedown.id).to.eq(1);
    });

    it(ActionTypes.TAKEDOWN_PROCESS, async function () {
        const [data = null] = await client.search({ action: ActionTypes.TAKEDOWN_PROCESS });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.TAKEDOWN_PROCESS, data);
        expect(data.takedown.id).to.eq(1);
    });

    it(ActionTypes.CREATED_FLAG_REASON, async function () {
        const [data = null] = await client.search({ action: ActionTypes.CREATED_FLAG_REASON });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.CREATED_FLAG_REASON, data);
        expect(data.flagReason.id).to.eq(1);
        expect(data.flagReason.reason).to.eq("Test");
    });

    it(ActionTypes.EDITED_FLAG_REASON, async function () {
        const [data = null] = await client.search({ action: ActionTypes.EDITED_FLAG_REASON });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.EDITED_FLAG_REASON, data);
        expect(data.flagReason.id).to.eq(1);
        expect(data.flagReason.reason).to.eq("Test");
    });

    it(ActionTypes.DELETED_FLAG_REASON, async function () {
        const [data = null] = await client.search({ action: ActionTypes.DELETED_FLAG_REASON });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.DELETED_FLAG_REASON, data);
        expect(data.flagReason.id).to.eq(1);
        expect(data.flagReason.reason).to.eq("Test");
    });

    it(ActionTypes.BULK_REVERT, async function () {
        const [data = null] = await client.search({ action: ActionTypes.BULK_REVERT });

        if (data === null) {
            return this.skip();
        }


        throw new Error(`Test not implemented: ${ActionTypes.BULK_REVERT}`);
    });

    it(ActionTypes.POST_MOVE_FAVORITES, async function () {
        const [data = null] = await client.search({ action: ActionTypes.POST_MOVE_FAVORITES });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.POST_MOVE_FAVORITES, data);
        expect(data.favorites.oldPost).to.eq(1);
        expect(data.favorites.newPost).to.eq(2);
    });

    it(ActionTypes.POST_DELETE, async function () {
        const [simple = null, complicated = null] = await client.search({ action: ActionTypes.POST_DELETE });

        if (simple === null || complicated === null) {
            return this.skip();
        }

        standard(ActionTypes.POST_DELETE, simple);
        expect(simple.post.id).to.eq(1);
        expect(simple.post.textReason).to.eq("Testing Reason");
        expect(simple.post.htmlReason).to.eq("Testing Reason");

        standard(ActionTypes.POST_DELETE, complicated);
        expect(complicated.post.id).to.eq(1);
        expect(complicated.post.textReason).to.eq("Don't open this: post #1You're Gaypost #1");
        expect(complicated.post.htmlReason).to.eq("Don't open this: <a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></p><div class=\"expandable\"><div class=\"expandable-header\"><span class=\"section-arrow\"></span><span>You're Gay</span></div><div class=\"expandable-content\" style=\"display: none;\"><p><a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></div></div>");
    });

    it(ActionTypes.POST_UNDELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.POST_UNDELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.POST_UNDELETE, data);
        expect(data.post.id).to.eq(1);
    });

    it(ActionTypes.POST_DESTROY, async function () {
        const [data = null] = await client.search({ action: ActionTypes.POST_DESTROY });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.POST_DESTROY, data);
        expect(data.post.id).to.eq(1);
    });

    it(ActionTypes.POST_RATING_LOCK, async function () {
        const [locked = null, unlocked = null] = await client.search({ action: ActionTypes.POST_RATING_LOCK });

        if (locked === null || unlocked === null) {
            return this.skip();
        }

        standard(ActionTypes.POST_RATING_LOCK, locked);
        expect(locked.post.id).to.eq(1);
        expect(locked.post.action).to.eq("locked");

        standard(ActionTypes.POST_RATING_LOCK, unlocked);
        expect(unlocked.post.id).to.eq(1);
        expect(unlocked.post.action).to.eq("unlocked");
    });

    it(ActionTypes.POST_UNAPPROVE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.POST_UNAPPROVE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.POST_UNAPPROVE, data);
        expect(data.post.id).to.eq(1);
    });

    it(ActionTypes.POST_REPLACEMENT_ACCEPT, async function () {
        const [data = null] = await client.search({ action: ActionTypes.POST_REPLACEMENT_ACCEPT });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.POST_REPLACEMENT_ACCEPT, data);
        expect(data.post.id).to.eq(1);
    });

    it(ActionTypes.POST_REPLACEMENT_REJECT, async function () {
        const [data = null] = await client.search({ action: ActionTypes.POST_REPLACEMENT_REJECT });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.POST_REPLACEMENT_REJECT, data);
        expect(data.post.id).to.eq(1);
    });

    it(ActionTypes.POST_REPLACEMENT_DELETE, async function () {
        const [data = null] = await client.search({ action: ActionTypes.POST_REPLACEMENT_DELETE });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.POST_REPLACEMENT_DELETE, data);
        expect(data.post.id).to.eq(1);
    });

    it(ActionTypes.EDITED_USER, async function () {
        const [data = null] = await client.search({ action: ActionTypes.EDITED_USER });

        if (data === null) {
            return this.skip();
        }

        standard(ActionTypes.EDITED_USER, data);
        expect(data.user.id).to.eq(null);
        expect(data.user.name).to.eq("test");
    });

    it(ActionTypes.CREATED_NEUTRAL_RECORD, async function () {
        const [simple = null, complicated = null] = await client.search({ action: ActionTypes.CREATED_NEUTRAL_RECORD }, true);

        if (simple === null || complicated === null) {
            return this.skip();
        }

        standard(ActionTypes.CREATED_NEUTRAL_RECORD, simple);
        expect(simple.user.id).to.eq(2);
        expect(simple.user.name).to.eq("test");
        expect(simple.record.id).to.eq(1);
        expect(simple.record.type).to.eq("neutral");
        expect(simple.record.textReason).to.eq("Testing Reason");
        expect(simple.record.htmlReason).to.eq("Testing Reason");

        standard(ActionTypes.CREATED_NEUTRAL_RECORD, complicated);
        expect(complicated.user.id).to.eq(2);
        expect(complicated.user.name).to.eq("test");
        expect(complicated.record.id).to.eq(1);
        expect(complicated.record.type).to.eq("neutral");
        expect(complicated.record.textReason).to.eq("Don't open this: post #1You're Gaypost #1");
        expect(complicated.record.htmlReason).to.eq("Don't open this: <a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></p><div class=\"expandable\"><div class=\"expandable-header\"><span class=\"section-arrow\"></span><span>You're Gay</span></div><div class=\"expandable-content\" style=\"display: none;\"><p><a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></div></div>");
    });

    it(ActionTypes.CREATED_NEGATIVE_RECORD, async function () {
        const [simple = null, complicated = null] = await client.search({ action: ActionTypes.CREATED_NEGATIVE_RECORD }, true);

        if (simple === null || complicated === null) {
            return this.skip();
        }

        standard(ActionTypes.CREATED_NEGATIVE_RECORD, simple);
        expect(simple.user.id).to.eq(2);
        expect(simple.user.name).to.eq("test");
        expect(simple.record.id).to.eq(1);
        expect(simple.record.type).to.eq("negative");
        expect(simple.record.textReason).to.eq("Testing Reason");
        expect(simple.record.htmlReason).to.eq("Testing Reason");

        standard(ActionTypes.CREATED_NEGATIVE_RECORD, complicated);
        expect(complicated.user.id).to.eq(2);
        expect(complicated.user.name).to.eq("test");
        expect(complicated.record.id).to.eq(1);
        expect(complicated.record.type).to.eq("negative");
        expect(complicated.record.textReason).to.eq("Don't open this: post #1You're Gaypost #1");
        expect(complicated.record.htmlReason).to.eq("Don't open this: <a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></p><div class=\"expandable\"><div class=\"expandable-header\"><span class=\"section-arrow\"></span><span>You're Gay</span></div><div class=\"expandable-content\" style=\"display: none;\"><p><a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></div></div>");
    });

    it(ActionTypes.CREATED_POSITIVE_RECORD, async function () {
        const [simple = null, complicated = null] = await client.search({ action: ActionTypes.CREATED_POSITIVE_RECORD }, true);

        if (simple === null || complicated === null) {
            return this.skip();
        }

        standard(ActionTypes.CREATED_POSITIVE_RECORD, simple);
        expect(simple.user.id).to.eq(2);
        expect(simple.user.name).to.eq("test");
        expect(simple.record.id).to.eq(1);
        expect(simple.record.type).to.eq("positive");
        expect(simple.record.textReason).to.eq("Testing Reason");
        expect(simple.record.htmlReason).to.eq("Testing Reason");

        standard(ActionTypes.CREATED_POSITIVE_RECORD, complicated);
        expect(complicated.user.id).to.eq(2);
        expect(complicated.user.name).to.eq("test");
        expect(complicated.record.id).to.eq(1);
        expect(complicated.record.type).to.eq("positive");
        expect(complicated.record.textReason).to.eq("Don't open this: post #1You're Gaypost #1");
        expect(complicated.record.htmlReason).to.eq("Don't open this: <a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></p><div class=\"expandable\"><div class=\"expandable-header\"><span class=\"section-arrow\"></span><span>You're Gay</span></div><div class=\"expandable-content\" style=\"display: none;\"><p><a rel=\"nofollow\" class=\"dtext-link\" href=\"/posts/1\">post #1</a></div></div>");
    });
});
