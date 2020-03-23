const fs = require('fs');
const path = require(`path`);
const mkdirp = require(`mkdirp`);
const withDefaults = require('./utils/default-options');
const { createFilePath } = require(`gatsby-source-filesystem`);
const { urlResolve, createContentDigest } = require(`gatsby-core-utils`);
// Make sure the data directory exists
exports.onPreBootstrap = ({ store }, themeOptions) => {
	const { program } = store.getState();
	const { coursePath, assetPath } = withDefaults(themeOptions);

	const dirs = [path.join(program.directory, coursePath), path.join(program.directory, assetPath)];

	dirs.forEach(dir => {
		if (!fs.existsSync(dir)) {
			mkdirp.sync(dir);
		}
	});
};

const mdxResolverPassthrough = fieldName => async (source, args, context, info) => {
	const type = info.schema.getType(`Mdx`);
	const mdxNode = context.nodeModel.getNodeById({
		id: source.parent,
	});
	const resolver = type.getFields()[fieldName].resolve;
	const result = await resolver(mdxNode, args, context, {
		fieldName,
	});
	return result;
};

exports.createSchemaCustomization = ({ actions, schema }) => {
	const { createTypes } = actions;
	createTypes(
		`interface Lesson @nodeInterface {
      id: ID!
      title: String!
      body: String!
			slug: String!
			module: Int!
			lesson: Int!
      description: String!
	}`
	);

	createTypes(
		`interface Module @nodeInterface {
			id: ID!
			title: String!
			slug: String!
			body: String!
			description: String!
		}`
	);

	createTypes(
		`interface Course @nodeInterface {
			id: ID!
			title: String!
			body: String!
			description: String!
		}`
	);

	createTypes(
		schema.buildObjectType({
			name: `MdxModule`,
			fields: {
				id: { type: `ID!` },
				title: {
					type: `String!`,
				},
				module: {
					type: `Int!`,
				},
				slug: {
					type: `String!`,
				},
				description: {
					type: `String!`,
				},
				body: {
					type: `String!`,
					resolve: mdxResolverPassthrough(`body`),
				},
			},
			interfaces: [`Node`, `Module`],
		})
	);

	createTypes(
		schema.buildObjectType({
			name: `MdxLesson`,
			fields: {
				id: { type: `ID!` },
				title: {
					type: `String!`,
				},
				slug: {
					type: `String!`,
				},
				description: {
					type: `String!`,
				},
				body: {
					type: `String!`,
					resolve: mdxResolverPassthrough(`body`),
				},
				lesson: {
					type: `Int!`,
				},
				module: {
					type: `Int!`,
				},
			},
			interfaces: [`Node`, `Lesson`],
		})
	);

	createTypes(
		schema.buildObjectType({
			name: `MdxCourse`,
			fields: {
				id: { type: `ID!` },
				title: {
					type: `String!`,
				},
				description: {
					type: `String!`,
				},
				body: {
					type: `String!`,
					resolve: mdxResolverPassthrough(`body`),
				},
			},
			interfaces: [`Node`, `Course`],
		})
	);
};

exports.onCreateNode = async ({ node, actions, getNode, createNodeId }, themeOptions) => {
	const { createNode, createParentChildLink } = actions;
	const { coursePath, basePath } = withDefaults(themeOptions);

	// Make sure it's an MDX node
	if (node.internal.type !== `Mdx`) {
		return;
	}

	// Create source field (according to coursePath)
	const fileNode = getNode(node.parent);
	const { sourceInstanceName: source, name } = fileNode;

	//make sure it's part of our course
	if (source !== coursePath) {
		return;
	}

	//lessons
	let slug;
	if (node.frontmatter.slug) {
		if (path.isAbsolute(node.frontmatter.slug)) {
			// absolute paths take precedence
			slug = node.frontmatter.slug;
		} else {
			// otherwise a relative slug gets turned into a sub path
			slug = urlResolve(basePath, node.frontmatter.slug);
		}
	} else {
		// otherwise use the filepath function from gatsby-source-filesystem
		const filePath = createFilePath({
			node: fileNode,
			getNode,
			basePath: coursePath,
		});

		slug = urlResolve(basePath, filePath);
	}
	// normalize use of trailing slash
	slug = slug.replace(/\/*$/, `/`);

	//landing pages
	if (name === 'index') {
		//module
		if (node.frontmatter.module) {
			const mdxModuleId = createNodeId(`${node.id} >>> MdxModule`);
			const fieldData = {
				title: node.frontmatter.title,
				module: node.frontmatter.module,
				description: node.frontmatter.description,
				slug: slug,
			};
			await createNode({
				...fieldData,
				// Required fields.
				id: mdxModuleId,
				parent: node.id,
				children: [],
				internal: {
					type: `MdxModule`,
					contentDigest: createContentDigest(fieldData),
					content: JSON.stringify(fieldData),
					description: `Mdx implementation of the Module interface`,
				},
			});
			createParentChildLink({ parent: node, child: getNode(mdxModuleId) });
		} else {
			//course landing page
			const mdxCourseId = createNodeId(`${node.id} >>> MdxCourse`);
			const fieldData = {
				title: node.frontmatter.title,
				description: node.frontmatter.description,
			};
			await createNode({
				...fieldData,
				// Required fields.
				id: mdxCourseId,
				parent: node.id,
				children: [],
				internal: {
					type: `MdxCourse`,
					contentDigest: createContentDigest(fieldData),
					content: JSON.stringify(fieldData),
					description: `Mdx implementation of the Course interface`,
				},
			});
			createParentChildLink({ parent: node, child: getNode(mdxCourseId) });
		}
	} else {
		//this is a lesson
		const fieldData = {
			title: node.frontmatter.title,
			slug,
			lesson: node.frontmatter.lesson,
			module: node.frontmatter.module,
			description: node.frontmatter.description,
		};

		const mdxLessonId = createNodeId(`${node.id} >>> MdxLesson`);
		await createNode({
			...fieldData,
			// Required fields.
			id: mdxLessonId,
			parent: node.id,
			children: [],
			internal: {
				type: `MdxLesson`,
				contentDigest: createContentDigest(fieldData),
				content: JSON.stringify(fieldData),
				description: `Mdx implementation of the Lesson interface`,
			},
		});
		createParentChildLink({ parent: node, child: getNode(mdxLessonId) });
	}
};

// These templates are simply data-fetching wrappers that import components
const CourseTemplate = require.resolve(`./src/templates/course-query`);
const ModuleTemplate = require.resolve(`./src/templates/module-query`);
const LessonTemplate = require.resolve('./src/templates/lesson-query');

exports.createPages = async ({ graphql, actions, reporter }, themeOptions) => {
	const { createPage } = actions;
	const { basePath } = withDefaults(themeOptions);

	const result = await graphql(`
		{
			allMdxModule(sort: { fields: module, order: ASC }) {
				edges {
					node {
						id
						slug
						module
						description
						parent {
							... on Mdx {
								fileAbsolutePath
							}
						}
					}
				}
			}
			allMdxLesson(sort: { fields: [module, lesson], order: ASC }) {
				edges {
					node {
						id
						slug
						module
						lesson
						description
					}
				}
			}
		}
	`);

	if (result.errors) {
		reporter.panic(result.errors);
	}

	// Create Posts and Post pages.
	const { allMdxModule, allMdxLesson } = result.data;
	const modules = allMdxModule.edges;
	const lessons = allMdxLesson.edges;

	// Create a page for each Module
	modules.forEach(({ node }, index) => {
		const next = index === modules.length - 1 ? null : modules[index + 1];
		const previous = index === 0 ? null : modules[index - 1];

		createPage({
			path: node.slug,
			component: ModuleTemplate,
			context: {
				id: node.id,
				slug: node.slug,
				module: node.module,
				previousId: previous ? previous.node.id : undefined,
				nextId: next ? next.node.id : undefined,
			},
		});
	});

	lessons.forEach(({ node }, index) => {
		const next = index === lessons.length - 1 ? null : lessons[index + 1];
		const previous = index === 0 ? null : lessons[index - 1];

		const { slug } = node;
		createPage({
			path: slug,
			component: LessonTemplate,
			context: {
				id: node.id,
				slug: slug,
				module: node.module,
				lesson: node.lesson,
				previousId: previous ? previous.node.id : undefined,
				nextId: next ? next.node.id : undefined,
			},
		});
	});

	// Create the Course page
	createPage({
		path: basePath,
		component: CourseTemplate,
		context: {},
	});
};
