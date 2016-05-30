# How to Contribute

Interested in contributing to the Augeo web application? Great! We could definitely use some help to fulfill our [vision](http://github.com/augeo/wiki/vision). And don't worry, you don't need to be a software developer to help out. Since this is a web application we need a variety of skills. Such as user experience engineers, graphic designers, writers to maintain content like this page, and other creative thinkers to help out with the underlying mechanics of awarded experience and levels. Of course, we need people for coding as well, such as NodeJs, AngularJs, and MongoDB developers.

Not only do you get the satisfaction of building something awesome, but working on open source projects are great for building your resume. Need an idea on what to tackle first? Visit [Feature Ideas](https://github.com/bpred754/augeo/issues/1), [Interface Ideas](https://github.com/bpred754/augeo/issues/2), or the general list of [Issues](https://github.com/bpred754/augeo/issues).

Before starting your contribution, <a href="https://www.clahub.com/agreements/bpred754/augeo">sign the Contributor License Agreement</a>. It also might be a good idea to familiarize yourself with the process defined below and the application [design](https://github.com/bpred754/augeo/wiki/Design).

##### Step 1 - Install Augeo
* Follow the instructions at this wiki [page](https://github.com/bpred754/augeo/wiki/install)

##### Step 3 - Make changes
* Make sure to conform to Augeo's coding standards (mentioned below)

##### Step 4 - Write Tests
* All test cases must pass before a pull request will be merged

##### Step 5 - Commit
* Repeat steps 3 through 5 until the task/issue is completed
* Make sure to follow Augeo's commit standards (mentioned below)

##### Step 6 - Submit pull request    
* Make sure to <a href="https://www.clahub.com/agreements/bpred754/augeo">sign the Contributor License Agreement (CLA)</a> before making a pull request
 
##### Further Reading 
Github has some great material for contributing to software projects that can be found [here](https://guides.github.com/activities/contributing-to-open-source/), [here](https://guides.github.com/activities/forking/), and [here](https://guides.github.com/introduction/flow/).

# Standards

Creating a standards document is essential to the maintainability of a software project. In order to prevent any hair pulling and head banging everyone should consider the standards mentioned below. 

### Coding Standards
* All files and folders will be named in lowercase with dashes separating words (e.g., javascript, test-case)
* All folders will be named in the singular tense (e.g., 'module' instead of 'modules')
* GPL V3 License at the top of every source file
* All functions in a file should be in alphabetic order, except for the constructor
* Test cases are required for all server side code
* Test case names should reflect their source counter part (e.g., src/utility/augeo-utility & test/test-case/utility/augeo-utility)

### Commit Standards
* Atomic commits (commit for each task or issue)
* Commit subject line is no longer than 50 characters
* Commit subject line always starts with a capital letter
* Commit subject line does not end with a period
* Use imperative mood in the subject line. A commit subject line should always be able to complete the following sentence:
  * If applied, this commit will...
  * E.g. If applied, this commit will _**Fix issue 23**_
* Commit body is optional, however the body must be wrapped at 72 characters
* Make sure commits do not contain your sensitive personal information. This information includes, but is not limited to your database configuration and access tokens
* For more information on how to write a git commit message, take a look [here](http://chris.beams.io/posts/git-commit/)

Have a suggestion to improve our coding standards? Leave a comment in our [Standards forum](https://github.com/bpred754/augeo/issues/4).
