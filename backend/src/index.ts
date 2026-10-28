import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import benmarkRouter from '../src/routes/benchmark'

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors())
app.use(express.json({limit : '1mb'}));


app.get('/health', (_req, res) =>{
    res.json({
        status : 'ok',
        service : 'llm-testbench-api'
    });
});

app.use('/api/benchmark', benmarkRouter);
app.use(
    (
    error : unknown,
    _req : express.Request,
    res : express.Response,
    _next : express.NextFunction, 
    ) => {
        console.error("Unhandled API error : ", error);
        res.status(500).json({
            error : "Internal server error"
        });
    }
);

app.listen(port, () =>{
    console.log(
        `LLM Testbench API listening on ${port}`
    );
    
})