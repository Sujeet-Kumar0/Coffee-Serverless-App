module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@libs/(.*)$': '<rootDir>/src/libs/$1',
        '^@models/(.*)$': '<rootDir>/src/models/$1',
        '^@types/(.*)$': '<rootDir>/src/types/$1',
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    roots: ['<rootDir>/tests']
};
