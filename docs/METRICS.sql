-- Weekly success metrics. Run against production with read-only access.
-- Targets from BRIEF.md, 3 months after public launch.

-- 1. Cafés with at least 3 ratings (target: 100)
SELECT count(*) AS ranked_cafes
FROM cafe_scores
WHERE sample_size >= 3;

-- 2. Ratings submitted (target: 500)
SELECT count(*) AS visible_ratings
FROM "Rating"
WHERE status = 'visible';

-- 3. Signed-in users who rated (target: 100)
SELECT count(DISTINCT "userId") AS raters
FROM "Rating"
WHERE "userId" IS NOT NULL
  AND status = 'visible';

-- 4. Month-over-month returning raters (target: 15%)
WITH monthly AS (
  SELECT date_trunc('month', "createdAt") AS month, "userId"
  FROM "Rating"
  WHERE "userId" IS NOT NULL
  GROUP BY 1, 2
)
SELECT
  current_month.month,
  count(DISTINCT previous."userId") AS returning
FROM monthly current_month
JOIN monthly previous
  ON previous.month = current_month.month - interval '1 month'
 AND previous."userId" = current_month."userId"
WHERE current_month.month >= date_trunc('month', current_date) - interval '3 months'
GROUP BY 1
ORDER BY 1;

-- Launch gate: at least 100 visible ratings across at least 40 cafés.
SELECT
  count(*) AS ratings,
  count(DISTINCT "cafeId") AS cafes
FROM "Rating"
WHERE status = 'visible';
