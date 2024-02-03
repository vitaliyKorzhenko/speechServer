/*
Копі запуск мовлення
 LOCAL! 
*/
INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "categoryId", "exerciseId", "courseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    48 AS categoryId, "exerciseId", 16 AS courseId, false
FROM public."CustomizeTasks"
WHERE "courseId" = 13 AND "categoryId" = 45;
/* 
PROD
КОПИРОВАНИЕ ПРИВІТАННЯ
*/

INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "categoryId", "exerciseId", "courseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    51 AS categoryId, "exerciseId", 16 AS courseId, false
FROM public."CustomizeTasks"
WHERE "courseId" = 13 AND "categoryId" = 46;

/*
КОПИРОВАНИЕ ОСНОВНОГО КУРСА
*/
INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "categoryId", "exerciseId", "courseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    52 AS categoryId, "exerciseId", 16 AS courseId, false
FROM public."CustomizeTasks"
WHERE "courseId" = 13 AND "categoryId" = 47;


-- Find all tasks for course
Select number,name
FROM "CustomizeTasks"
WHERE "courseId" = 13 AND "categoryId" = 47 AND name = 'Розвиток дрібної моторики. "Ножиці"'
ORDER BY number

/*
Копирование запуск речи
courseId = 8 
newCourseId = 15
*/

INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "categoryId", "exerciseId", "courseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    48 AS categoryId, "exerciseId", 15 AS courseId, false
FROM public."CustomizeTasks"
WHERE "courseId" = 8 AND "categoryId" = 45;

/*
Копирование приветствия
*/
 
-- Визначення нових значень courseId та categoryId
DECLARE oldCourseId integer;
DECLARE oldCategoryId integer;

DECLARE newCourseId integer;
DECLARE newCategoryId integer;


SET oldCourseId = 8;    -- Старий courseId
SET oldCategoryId = 39; -- Старий categoryId

SET newCourseId = 15;  -- Новий courseId
SET newCategoryId = 50; -- Новий categoryId



-- Вставка даних зі зміненими значеннями courseId та categoryId
INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "categoryId", "exerciseId", "courseId", isBlocking)
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", createdAt, updatedAt,
    newCategoryId AS categoryId, "exerciseId", newCourseId AS courseId, false
FROM public."CustomizeTasks"
WHERE "courseId" = oldCourseId AND "categoryId" = oldCategoryId;


-- КОПИРОВАНИЕ ФРАЗОВАЯ РЕЧЬ ЛОКАЛ

INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "categoryId", "exerciseId", "courseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    52 AS categoryId, "exerciseId", 17 AS courseId, false
FROM public."CustomizeTasks"
WHERE "courseId" = 10 AND "categoryId" = 39;

INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "categoryId", "exerciseId", "courseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    53 AS categoryId, "exerciseId", 17 AS courseId, false
FROM public."CustomizeTasks"
WHERE "courseId" = 10 AND "categoryId" = 40;


-- КОПИРОВАНИЕ ФРАЗОВАЯ РЕЧЬ ПРОДАКШН

INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "categoryId", "exerciseId", "courseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    53 AS categoryId, "exerciseId", 17 AS courseId, false
FROM public."CustomizeTasks"
WHERE "courseId" = 10 AND "categoryId" = 39;

INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "categoryId", "exerciseId", "courseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    54 AS categoryId, "exerciseId", 17 AS courseId, false
FROM public."CustomizeTasks"
WHERE "courseId" = 10 AND "categoryId" = 40;


/* КОПИРОВАНИЕ ФРАЗОВЕ МОВЛЕННЯ (без куратора)
LOCAL
*/

INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "courseId", "categoryId", "exerciseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    18 AS courseId, 54 AS categoryId, "exerciseId", false
FROM public."CustomizeTasks"
WHERE "courseId" = 14 AND "categoryId" = 45;



INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "courseId", "categoryId", "exerciseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    18 AS courseId, 55 AS categoryId, "exerciseId", false
FROM public."CustomizeTasks"
WHERE "courseId" = 14 AND "categoryId" = 48;

-- копирование основного фразове мовлення прод

INSERT INTO public."CustomizeTasks" (name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt", "courseId", "categoryId", "exerciseId", "isBlocking")
SELECT
    name, type, "countForCancel", number, "countForSuccess", "countForBlock", "createdAt", "updatedAt",
    18 AS courseId, 56 AS categoryId, "exerciseId", false
FROM public."CustomizeTasks"
WHERE "courseId" = 14 AND "categoryId" = 47;