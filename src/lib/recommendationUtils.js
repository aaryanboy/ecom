/**
 * Utility functions for the hierarchical recommendation system.
 */

const MAX_TAGS_PER_SUBCATEGORY = 10;
const MAX_SUBCATEGORIES_PER_CATEGORY = 5;

/**
 * Updates user interests based on an interaction.
 * @param {Object} user - The mongoose user document.
 * @param {Object} product - The product being interacted with.
 * @param {string} interactionType - 'view', 'click', or 'buy'.
 */
export async function updateUserInterests(user, product, interactionType) {
    const { category, subCategory, tags } = product;
    if (!category || !subCategory) return;

    const weightIncrement = interactionType === 'buy' ? 10 : 1;
    const now = new Date();

    if (!user.interests) user.interests = [];

    // 1. Find or create Category
    let categoryInterest = user.interests.find(i => i.category === category);
    if (!categoryInterest) {
        categoryInterest = {
            category,
            lastInteractionAt: now,
            subcategories: []
        };
        user.interests.push(categoryInterest);
    } else {
        categoryInterest.lastInteractionAt = now;
    }

    // 2. Find or create Subcategory
    let subcategoryInterest = categoryInterest.subcategories.find(s => s.name === subCategory);
    if (!subcategoryInterest) {
        subcategoryInterest = {
            name: subCategory,
            lastInteractionAt: now,
            tags: []
        };
        categoryInterest.subcategories.push(subcategoryInterest);
    } else {
        subcategoryInterest.lastInteractionAt = now;
    }

    // 3. Update Tags
    if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
            if (!tagName) continue;
            let tag = subcategoryInterest.tags.find(t => t.name === tagName);
            if (tag) {
                tag.weight += weightIncrement;
                tag.lastInteractionAt = now;
            } else {
                subcategoryInterest.tags.push({
                    name: tagName,
                    weight: weightIncrement,
                    lastInteractionAt: now
                });
            }
        }
    }

    // 4. Prune
    pruneInterests(user);
}

/**
 * Prunes the user interests to keep only top N items.
 * @param {Object} user 
 */
export function pruneInterests(user) {
    if (!user.interests) return;

    user.interests.forEach(cat => {
        // Prune Tags per Subcategory
        cat.subcategories.forEach(sub => {
            if (sub.tags.length > MAX_TAGS_PER_SUBCATEGORY) {
                sub.tags.sort((a, b) => b.weight - a.weight || b.lastInteractionAt - a.lastInteractionAt);
                sub.tags = sub.tags.slice(0, MAX_TAGS_PER_SUBCATEGORY);
            }
        });

        // Prune Subcategories per Category
        if (cat.subcategories.length > MAX_SUBCATEGORIES_PER_CATEGORY) {
            // Rank subcategories by most recent interaction and total weight?
            // Actually, let's use recency as primary for subcategories/categories as requested.
            cat.subcategories.sort((a, b) => b.lastInteractionAt - a.lastInteractionAt);
            cat.subcategories = cat.subcategories.slice(0, MAX_SUBCATEGORIES_PER_CATEGORY);
        }
    });

    // Optionally sort categories by recency too
    user.interests.sort((a, b) => b.lastInteractionAt - a.lastInteractionAt);
}

/**
 * Gets recommendation priority scores for categories and subcategories.
 * Useful for building the final recommendation query.
 */
export function getInterestScores(user) {
    if (!user.interests) return [];

    // Flatten for ranking if needed, or return structured
    return user.interests.map(cat => ({
        category: cat.category,
        lastInteractionAt: cat.lastInteractionAt,
        subcategories: cat.subcategories.map(sub => ({
            name: sub.name,
            lastInteractionAt: sub.lastInteractionAt,
            topTags: sub.tags.map(t => t.name)
        }))
    }));
}
