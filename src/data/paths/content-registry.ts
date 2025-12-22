import { PathDayContent } from '@/types/learning-paths';

// Python
import { days as pyBeginner } from './python/beginner';
import { days as pyDS } from './python/data-scientist';
import { days as pyBackend } from './python/backend';
import { days as pyML } from './python/ml-engineer';

// JavaScript
import { days as jsBeginner } from './javascript/beginner';
import { days as jsFrontend } from './javascript/frontend';
import { days as jsFullstack } from './javascript/fullstack';
import { days as jsNode } from './javascript/nodejs';

// TypeScript
import tsContent from './typescript/index';

// Java
import { beginnerDays as javaBeginner, backendDays as javaBackend, androidDays as javaAndroid } from './java/index';

// C++
import { beginnerDays as cppBeginner, gameDevDays as cppGame, systemsDays as cppSys } from './cpp/index';

// Go
import { beginnerDays as goBeginner, backendDays as goBackend, devopsDays as goDevops } from './go/index';

// C#
import { beginnerDays as csBeginner, unityDays as csUnity, dotnetDays as csDotnet } from './csharp/index';

const contentMap: Record<string, PathDayContent[]> = {
    // Python
    'python-beginner': pyBeginner,
    'python-data-scientist': pyDS,
    'python-backend': pyBackend,
    'python-ml-engineer': pyML,

    // JavaScript
    'javascript-beginner': jsBeginner,
    'javascript-frontend': jsFrontend,
    'javascript-fullstack': jsFullstack,
    'javascript-nodejs': jsNode,

    // TypeScript
    'typescript-beginner': tsContent.beginner.days,
    'typescript-frontend': tsContent.frontend.days,
    'typescript-fullstack': tsContent.fullstack.days,

    // Java
    'java-beginner': javaBeginner,
    'java-backend': javaBackend,
    'java-android': javaAndroid,

    // C++
    'cpp-beginner': cppBeginner,
    'cpp-game-dev': cppGame,
    'cpp-systems': cppSys,

    // Go
    'go-beginner': goBeginner,
    'go-backend': goBackend,
    'go-devops': goDevops,

    // C#
    'csharp-beginner': csBeginner,
    'csharp-game-unity': csUnity,
    'csharp-dotnet': csDotnet,
};

export const getPathContent = (pathId: string): PathDayContent[] | null => {
    return contentMap[pathId] || null;
};
