const express = require('express');
const cors = require('cors');

const participantsRouter = require('./routes/participants');
const subjectTypesRouter = require('./routes/subjectTypes');
const programsRouter = require('./routes/programs');
const rolePermissionsRouter = require('./routes/rolePermissions');
const spiritualRolesRouter = require('./routes/spiritualRoles');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend API for Planificateur de Reunions Theocratiques' });
});

app.use('/participants', participantsRouter);
app.use('/subjectTypes', subjectTypesRouter);
app.use('/programs', programsRouter);
app.use('/rolePermissions', rolePermissionsRouter);
app.use('/spiritualRoles', spiritualRolesRouter);

module.exports = app;
