/**
 * Sample AST data for performance optimization example
 */

import type { ASTNode } from '@hyperfixi/ast-toolkit';

/**
 * Generate a simple AST with minimal nodes for baseline testing
 */
export function generateSimpleAST(): ASTNode {
  return {
    type: 'program',
    start: 0,
    end: 50,
    line: 1,
    column: 1,
    features: [
      {
        type: 'eventHandler',
        event: 'click',
        selector: '#button',
        start: 0,
        end: 50,
        line: 1,
        column: 1,
        commands: [
          {
            type: 'command',
            name: 'toggle',
            start: 10,
            end: 30,
            line: 1,
            column: 11,
            args: [{ type: 'selector', value: '.active', start: 17, end: 24, line: 1, column: 18 }]
          }
        ]
      }
    ]
  } as any;
}

/**
 * Generate a moderately complex AST for intermediate testing
 */
export function generateComplexAST(): ASTNode {
  return {
    type: 'program',
    start: 0,
    end: 500,
    line: 1,
    column: 1,
    features: [
      // Multiple event handlers with various complexity
      {
        type: 'eventHandler',
        event: 'click',
        selector: '.modal-trigger',
        start: 0,
        end: 100,
        line: 1,
        column: 1,
        commands: [
          {
            type: 'command',
            name: 'add',
            start: 20,
            end: 40,
            line: 1,
            column: 21,
            args: [{ type: 'selector', value: '.loading', start: 25, end: 33, line: 1, column: 26 }]
          },
          {
            type: 'command',
            name: 'fetch',
            start: 45,
            end: 65,
            line: 1,
            column: 46,
            args: [{ type: 'literal', value: '/api/modal', start: 51, end: 62, line: 1, column: 52 }]
          },
          {
            type: 'conditional',
            start: 70,
            end: 95,
            line: 1,
            column: 71,
            condition: {
              type: 'binaryExpression',
              operator: '===',
              left: { type: 'memberExpression', property: { type: 'identifier', name: 'status' } },
              right: { type: 'literal', value: 200 }
            },
            then: {
              type: 'command',
              name: 'toggle',
              args: [{ type: 'selector', value: '.modal-open' }]
            },
            else: {
              type: 'command',
              name: 'put',
              args: [{ type: 'literal', value: 'Error loading content' }],
              target: { type: 'selector', value: '.error-message' }
            }
          }
        ]
      },
      {
        type: 'eventHandler',
        event: 'input',
        selector: 'input[type="email"]',
        start: 105,
        end: 200,
        line: 3,
        column: 1,
        commands: [
          {
            type: 'conditional',
            start: 125,
            end: 180,
            line: 3,
            column: 21,
            condition: {
              type: 'callExpression',
              callee: { type: 'memberExpression', property: { type: 'identifier', name: 'matches' } },
              arguments: [{ type: 'literal', value: '/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/' }]
            },
            then: {
              type: 'command',
              name: 'remove',
              args: [{ type: 'selector', value: '.invalid' }]
            },
            else: {
              type: 'command',
              name: 'add',
              args: [{ type: 'selector', value: '.invalid' }]
            }
          }
        ]
      },
      {
        type: 'eventHandler',
        event: 'submit',
        selector: '#contact-form',
        start: 205,
        end: 350,
        line: 5,
        column: 1,
        commands: [
          {
            type: 'command',
            name: 'add',
            start: 225,
            end: 245,
            line: 5,
            column: 21,
            args: [{ type: 'selector', value: '.submitting', start: 230, end: 241, line: 5, column: 26 }]
          },
          {
            type: 'command',
            name: 'fetch',
            start: 250,
            end: 290,
            line: 5,
            column: 46,
            args: [
              { type: 'literal', value: '/api/contact', start: 256, end: 268, line: 5, column: 52 },
              { type: 'identifier', name: 'form', start: 270, end: 274, line: 5, column: 66 }
            ]
          },
          {
            type: 'command',
            name: 'put',
            start: 295,
            end: 330,
            line: 5,
            column: 91,
            args: [{ type: 'literal', value: 'Message sent!', start: 300, end: 314, line: 5, column: 96 }],
            target: { type: 'selector', value: '#success', start: 320, end: 328, line: 5, column: 116 }
          },
          {
            type: 'command',
            name: 'remove',
            start: 335,
            end: 350,
            line: 5,
            column: 131,
            args: [{ type: 'selector', value: '.submitting', start: 342, end: 353, line: 5, column: 138 }]
          }
        ]
      },
      // Behavior definitions
      {
        type: 'behavior',
        name: 'modal-handler',
        start: 355,
        end: 400,
        line: 7,
        column: 1,
        parameters: ['trigger', 'modal'],
        body: [
          {
            type: 'command',
            name: 'toggle',
            args: [{ type: 'selector', value: '.modal-open' }]
          }
        ]
      },
      // Function definitions
      {
        type: 'function',
        name: 'validateEmail',
        start: 405,
        end: 450,
        line: 9,
        column: 1,
        parameters: ['email'],
        body: {
          type: 'returnStatement',
          argument: {
            type: 'callExpression',
            callee: { type: 'memberExpression', property: { type: 'identifier', name: 'test' } }
          }
        }
      }
    ]
  } as any;
}

/**
 * Generate a large AST with specified number of nodes for scalability testing
 */
export function generateMassiveAST(targetNodeCount: number = 1000): ASTNode {
  // Calculate how many features to generate to reach target node count
  // Each feature typically contains 3-5 nodes
  const featuresNeeded = Math.ceil(targetNodeCount / 4);
  
  const features = Array.from({ length: featuresNeeded }, (_, i) => {
    const eventType = ['click', 'submit', 'input', 'hover', 'focus'][i % 5];
    const commandsCount = 2 + (i % 4); // 2-5 commands per handler
    
    return {
      type: 'eventHandler',
      event: eventType,
      selector: `.element-${i}`,
      start: i * 20,
      end: (i + 1) * 20,
      line: i + 1,
      column: 1,
      commands: Array.from({ length: commandsCount }, (_, j) => {
        const commandType = ['add', 'remove', 'toggle', 'put', 'fetch'][j % 5];
        
        const command: any = {
          type: 'command',
          name: commandType,
          start: i * 20 + j * 3,
          end: i * 20 + j * 3 + 3,
          line: i + 1,
          column: j * 3 + 1,
          args: [{ 
            type: commandType === 'fetch' ? 'literal' : 'selector', 
            value: commandType === 'fetch' ? `/api/endpoint-${i}-${j}` : `.class-${i}-${j}`,
            start: 0, 
            end: 10, 
            line: i + 1, 
            column: 1 
          }]
        };
        
        // Add conditional logic occasionally for complexity
        if (i % 7 === 0 && j === 0) {
          return {
            type: 'conditional',
            start: i * 20 + j * 3,
            end: i * 20 + j * 3 + 6,
            line: i + 1,
            column: j * 3 + 1,
            condition: {
              type: 'binaryExpression',
              operator: '>',
              left: { type: 'memberExpression', property: { type: 'identifier', name: 'length' } },
              right: { type: 'literal', value: i % 10 }
            },
            then: command,
            else: {
              type: 'command',
              name: 'put',
              args: [{ type: 'literal', value: 'Default value' }]
            }
          };
        }
        
        return command;
      })
    };
  });
  
  return {
    type: 'program',
    start: 0,
    end: featuresNeeded * 20,
    line: 1,
    column: 1,
    features
  } as any;
}

/**
 * Generate a realistic codebase structure for comprehensive testing
 */
export function generateRealisticCodebase(): { files: ASTNode[]; totalNodes: number } {
  const files: ASTNode[] = [];
  let totalNodes = 0;
  
  // Main application file (large and complex)
  const mainApp = generateMassiveAST(200);
  files.push(mainApp);
  totalNodes += countNodesInAST(mainApp);
  
  // Component files (medium complexity)
  for (let i = 0; i < 5; i++) {
    const component = generateComponentAST(`Component${i + 1}`, 50 + i * 20);
    files.push(component);
    totalNodes += countNodesInAST(component);
  }
  
  // Utility files (simple)
  for (let i = 0; i < 3; i++) {
    const utility = generateUtilityAST(`Utility${i + 1}`, 20 + i * 10);
    files.push(utility);
    totalNodes += countNodesInAST(utility);
  }
  
  // Configuration files (minimal)
  for (let i = 0; i < 2; i++) {
    const config = generateConfigAST(`Config${i + 1}`, 10 + i * 5);
    files.push(config);
    totalNodes += countNodesInAST(config);
  }
  
  return { files, totalNodes };
}

/**
 * Generate a component-style AST
 */
function generateComponentAST(componentName: string, complexity: number): ASTNode {
  const features = Array.from({ length: complexity / 10 }, (_, i) => ({
    type: 'eventHandler',
    event: ['click', 'input', 'submit', 'hover'][i % 4],
    selector: `.${componentName.toLowerCase()}-${i}`,
    start: i * 15,
    end: (i + 1) * 15,
    line: i + 1,
    column: 1,
    commands: [
      {
        type: 'command',
        name: ['add', 'remove', 'toggle', 'put'][i % 4],
        start: i * 15 + 2,
        end: i * 15 + 8,
        line: i + 1,
        column: 3,
        args: [{ 
          type: 'selector', 
          value: `.${componentName.toLowerCase()}-state`,
          start: 0, 
          end: 10, 
          line: i + 1, 
          column: 1 
        }]
      },
      {
        type: 'command',
        name: 'fetch',
        start: i * 15 + 10,
        end: i * 15 + 15,
        line: i + 1,
        column: 11,
        args: [{ 
          type: 'literal', 
          value: `/api/${componentName.toLowerCase()}/${i}`,
          start: 0, 
          end: 15, 
          line: i + 1, 
          column: 1 
        }]
      }
    ]
  }));
  
  return {
    type: 'program',
    start: 0,
    end: complexity * 15,
    line: 1,
    column: 1,
    features
  } as any;
}

/**
 * Generate a utility-style AST with function definitions
 */
function generateUtilityAST(utilityName: string, complexity: number): ASTNode {
  const features = Array.from({ length: complexity / 5 }, (_, i) => ({
    type: 'function',
    name: `${utilityName.toLowerCase()}Function${i}`,
    start: i * 10,
    end: (i + 1) * 10,
    line: i + 1,
    column: 1,
    parameters: [`param${i}`],
    body: {
      type: 'returnStatement',
      argument: {
        type: 'binaryExpression',
        operator: '+',
        left: { type: 'identifier', name: `param${i}` },
        right: { type: 'literal', value: i }
      }
    }
  }));
  
  return {
    type: 'program',
    start: 0,
    end: complexity * 10,
    line: 1,
    column: 1,
    features
  } as any;
}

/**
 * Generate a configuration-style AST
 */
function generateConfigAST(configName: string, complexity: number): ASTNode {
  const features = Array.from({ length: complexity / 3 }, (_, i) => ({
    type: 'behavior',
    name: `${configName.toLowerCase()}Behavior${i}`,
    start: i * 5,
    end: (i + 1) * 5,
    line: i + 1,
    column: 1,
    parameters: [],
    body: [
      {
        type: 'command',
        name: 'set',
        args: [
          { type: 'identifier', name: `setting${i}` },
          { type: 'literal', value: `value${i}` }
        ]
      }
    ]
  }));
  
  return {
    type: 'program',
    start: 0,
    end: complexity * 5,
    line: 1,
    column: 1,
    features
  } as any;
}

/**
 * Count nodes in an AST (simple recursive counting)
 */
function countNodesInAST(ast: ASTNode): number {
  let count = 1; // Count the current node
  
  // Count features
  if ((ast as any).features) {
    for (const feature of (ast as any).features) {
      count += countNodesInAST(feature);
    }
  }
  
  // Count commands
  if ((ast as any).commands) {
    for (const command of (ast as any).commands) {
      count += countNodesInAST(command);
    }
  }
  
  // Count args
  if ((ast as any).args) {
    for (const arg of (ast as any).args) {
      count += countNodesInAST(arg);
    }
  }
  
  // Count conditional branches
  if ((ast as any).then) {
    count += countNodesInAST((ast as any).then);
  }
  if ((ast as any).else) {
    count += countNodesInAST((ast as any).else);
  }
  
  // Count body
  if ((ast as any).body) {
    if (Array.isArray((ast as any).body)) {
      for (const item of (ast as any).body) {
        count += countNodesInAST(item);
      }
    } else {
      count += countNodesInAST((ast as any).body);
    }
  }
  
  return count;
}